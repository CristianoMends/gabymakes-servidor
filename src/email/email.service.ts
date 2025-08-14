import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    async sendConfirmationEmailToOwner(
        subject: string,
        name: string,
        email: string,
        address: string,
        purchaseId: string
    ): Promise<void> {
        const contactEmailTo = this.configService.get<string>('CONTACT_EMAIL_TO');

        await this.mailerService.sendMail({
            to: contactEmailTo,
            from: this.configService.get<string>('EMAIL_FROM'),
            subject: subject || `Nova Compra Recebida - Pedido #${purchaseId}`,
            template: './confirmation-to-owner',
            context: {
                name,
                email,
                address,
                orderId: purchaseId,
            },
        });
    }

    async sendConfirmationEmailToClient(
        subject: string,
        name: string,
        email: string,
        address: string,
        purchaseId: string
    ): Promise<void> {
        await this.mailerService.sendMail({
            to: email,
            from: this.configService.get<string>('EMAIL_FROM'),
            subject: subject || `Confirmação: Pedido #${purchaseId} Recebido!`,
            template: './confirmation-to-client',
            context: {
                name,
                email,
                address,
                purchaseId,
            },
        });
    }
}
