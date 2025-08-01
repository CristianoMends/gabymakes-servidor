import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import * as crypto from 'crypto';
import { Product } from 'src/products/entities/product.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
    private client: MercadoPagoConfig;
    private readonly webhookSecret: string;
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>
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

                console.log('product:', product)


                return {
                    id: product.id,
                    title: product.description,
                    quantity: item.quantity,
                    unit_price: Number(product.price),
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
                success: 'https://gabymakes-website.vercel.app/payment/success',
                failure: 'https://gabymakes-website.vercel.app/payment/failure',
                pending: '',
            },
            auto_return: 'approved' as const,
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

        // ETAPA 1: VERIFICAR A AUTENTICIDADE DO WEBHOOK
        if (!this.isValidWebhook(headers, paymentId)) {
            this.logger.warn('Webhook inválido recebido. Assinatura não corresponde.');
            return; // Ignora o processamento
        }

        this.logger.log('Webhook verificado com sucesso!');

        try {
            // ETAPA 2: BUSCAR OS DADOS ATUALIZADOS DO PAGAMENTO
            const payment = await new Payment(this.client).get({ id: paymentId });

            this.logger.log(`Status do pagamento: ${payment.status}`);

            // ETAPA 3: EXECUTAR SUA LÓGICA DE NEGÓCIO
            if (payment.status === 'approved') {
                // TODO: Atualize o status do pedido no seu banco de dados para "PAGO"
                this.logger.log(`Pagamento ${paymentId} APROVADO. Atualizando banco de dados...`);
                // Ex: await this.orderRepository.update(payment.external_reference, { status: 'PAID' });
            } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                // TODO: Atualize o status do pedido no seu banco de dados para "FALHOU" ou "CANCELADO"
                this.logger.log(`Pagamento ${paymentId} foi ${payment.status}.`);
            }

        } catch (error) {
            this.logger.error('Erro ao processar o webhook:', error);
        }
    }

    async getPaymentDetails(paymentId: string) {
        this.logger.log(`Buscando detalhes do pagamento: ${paymentId}`);
        try {
            const payment = await new Payment(this.client).get({ id: paymentId });

            // É aqui que você pode executar lógicas importantes,
            // como criar o pedido final no seu banco de dados, se o webhook falhar.
            if (payment.status === 'approved') {
                // TODO: Verificar se o pedido já foi criado pelo webhook. Se não, crie-o aqui.
                // Ex: await this.orderService.findOrCreateByPaymentId(paymentId);
            }

            // Retorna apenas os dados necessários para o front-end
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