import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import * as crypto from 'crypto';
import { Product } from 'src/products/entities/product.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { OrdersService } from 'src/order/order.service';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { Address } from 'src/address/entities/address.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentService {
    private client: MercadoPagoConfig;
    private readonly webhookSecret: string;
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly emailService: EmailService,
        private readonly orderService: OrdersService,
    ) {
        const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN')!;
        this.webhookSecret = this.configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET')!;
        this.client = new MercadoPagoConfig({ accessToken: accessToken });
    }

    async createPaymentPreference(paymentData: CreatePaymentDto) {
        this.logger.log(`Iniciando criação de preferência para ${paymentData.items.length} item(s).`);

        const itemsParaMercadoPago = await Promise.all(
            paymentData.items.map(async (item) => {
                const product = await this.productRepo.findOne({ where: { id: item.id } });

                if (!product) {
                    throw new NotFoundException(`Produto com ID ${item.id} não encontrado.`);
                }

                return {
                    id: product.id,
                    title: product.description,
                    quantity: item.quantity,
                    unit_price: Number(product.price) - (Number(product.price) * (product.discount / 100)),
                    currency_id: 'BRL',
                };
            })
        );

        if (itemsParaMercadoPago.length === 0) {
            throw new Error("Nenhum item válido para processar.");
        }

        const body = {
            items: itemsParaMercadoPago,
            back_urls: {
                success: 'https://gabymakes.vercel.app/payment/success',
                failure: 'https://gabymakes.vercel.app/payment/failure',
                pending: '',
            },
            auto_return: 'approved' as const,
            metadata: {
                userId: paymentData.userId,
                addressId: paymentData.addressId
            },
        };

        const preference = new Preference(this.client);

        try {
            const result = await preference.create({ body });
            this.logger.log(`Preferência de pagamento criada: ${result.id}`);
            return {
                id: result.id,
                init_point: result.init_point,
            };
        } catch (error) {
            this.logger.error('Erro ao criar preferência de pagamento no MP:', error.cause || error.message);
            throw new InternalServerErrorException('Falha ao criar preferência de pagamento.');
        }
    }

    private isValidWebhook(headers: any, dataId: string): boolean {
        const signature = headers['x-signature'];
        const requestId = headers['x-request-id'];

        if (!signature || !requestId) {
            return false;
        }

        const parts = signature.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            acc[key.trim()] = value.trim();
            return acc;
        }, {});

        const timestamp = parts.ts;
        const signatureHash = parts.v1;

        const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;

        const hmac = crypto.createHmac('sha256', this.webhookSecret);
        hmac.update(manifest);
        const calculatedSignature = hmac.digest('hex');

        return signatureHash === calculatedSignature;
    }

    async processWebhook(paymentId: string, headers: any) {
        this.logger.log(`Processando webhook para o pagamento ID: ${paymentId}`);

        if (!this.isValidWebhook(headers, paymentId)) {
            this.logger.warn('Webhook inválido recebido. Assinatura não corresponde.');
            return;
        }

        this.logger.log('Webhook verificado com sucesso!');

        try {
            const payment = await new Payment(this.client).get({ id: paymentId });

            this.logger.log(`Status do pagamento: ${payment.status}`);

            if (payment.status === 'approved') {
                this.logger.log(`Pagamento ${paymentId} APROVADO. Criando pedido...`);

                const userId = payment.metadata?.userId;
                const addressId = payment.metadata?.addressId;

                if (!userId || !addressId) {
                    this.logger.error(`Não foi possível criar o pedido: userId ou addressId ausentes no metadata.`);
                    return;
                }

                const user = await this.userRepo.findOne({ where: { id: userId } });
                const address = await this.addressRepo.findOne({ where: { id: Number(addressId) } });

                const createOrderDto: CreateOrderDto = {
                    customerName: `${user?.firstName} ${user?.lastName}` || 'Cliente',
                    customerEmail: user?.email || '',
                    deliveryAddress: `${address?.street}, ${address?.city} - ${address?.state} ${address?.zipCode}` || 'Endereço não informado',
                    items: payment.additional_info?.items?.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })) || [],
                };

                const order = await this.orderService.createOrder(createOrderDto);
                this.logger.log(`Pedido criado com ID: ${order.id}`);

                if (createOrderDto.customerEmail) {
                    await this.emailService.sendConfirmationEmailToClient(
                        'Confirmação de pedido',
                        createOrderDto.customerName,
                        createOrderDto.customerEmail,
                        createOrderDto.deliveryAddress,
                        order.id,
                    );
                    this.logger.log(`Email enviado para o cliente.`);
                }

                await this.emailService.sendConfirmationEmailToOwner(
                    'Novo pedido recebido',
                    createOrderDto.customerName,
                    createOrderDto.customerEmail,
                    createOrderDto.deliveryAddress,
                    order.id,
                );
                this.logger.log(`Email enviado para o dono do site.`);
            }
            else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                this.logger.log(`Pagamento ${paymentId} foi ${payment.status}.`);
            }

        } catch (error) {
            this.logger.error('Erro ao processar o webhook:', error);
        }
    }


    async getPaymentDetails(
        paymentId: string
    ) {
        this.logger.log(`Buscando detalhes do pagamento: ${paymentId}`);
        try {
            const payment = await new Payment(this.client).get({ id: String(paymentId) });

            return {
                id: payment.id,
                status: payment.status,
                date_approved: payment.date_approved,
                payer_email: payment.payer?.email,
            };
        } catch (error) {
            this.logger.error(`Erro ao buscar pagamento ${paymentId}`, error);
            throw new NotFoundException(`Pagamento com ID ${paymentId} não encontrado.`);
        }
    }
}