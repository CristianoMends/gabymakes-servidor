import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private client: MercadoPagoConfig;
    private readonly webhookSecret: string;
    private readonly logger = new Logger(PaymentService.name);

    constructor(private configService: ConfigService) {
        const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN')!;
        this.webhookSecret = this.configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET')!;
        this.client = new MercadoPagoConfig({ accessToken: accessToken });
    }

    async createPaymentPreference(items: any[]) {

        const body = {
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                unit_price: item.price,
                currency_id: 'BRL',
            })),
            back_urls: {
                success: 'http://localhost:3000/success',
                failure: 'http://localhost:3000/failure',
                pending: '',
            },
            auto_return: 'approved' as const, // Retorna automaticamente para o site
        };

        const preference = new Preference(this.client);

        try {
            const result = await preference.create({ body });

            return {
                id: result.id, // ID da preferência, que será usado no frontend
                init_point: result.init_point, // URL de checkout para redirecionamento
            };
        } catch (error) {
            console.error('Erro ao criar preferência de pagamento:', error);
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
            // NUNCA confie no corpo do webhook. Use o ID para buscar a informação fresca e segura.
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
}