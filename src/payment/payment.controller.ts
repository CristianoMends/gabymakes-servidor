import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';


@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create')
  async createPayment(
    @Body() paymentData: CreatePaymentDto,
    @Res() res: Response,
  ) {
    try {
      const preference = await this.paymentService.createPaymentPreference(paymentData);
      return res.json(preference);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Query('type') type: string,
    @Query('data.id') dataId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Para depuração inicial, vamos logar tudo que chega
    console.log('--- Webhook Recebido ---');
    console.log('Tipo (Type):', type);
    console.log('ID do Dado (Data ID):', dataId);
    console.log('Corpo (Body):', req.body);
    console.log('Cabeçalhos (Headers):', req.headers);
    console.log('------------------------');

    // É crucial responder ao Mercado Pago com status 200 ou 201 OK
    // para que ele saiba que você recebeu o webhook e não tente enviar de novo.
    res.status(HttpStatus.OK).send();

    // Apenas processe eventos do tipo 'payment'
    if (type === 'payment') {
      // Delega o processamento para o nosso serviço
      // Passamos o ID do pagamento e os cabeçalhos para verificação
      await this.paymentService.processWebhook(dataId, req.headers);
    }
  }

  @Get('status/:payment_id')
  async getPaymentStatus(
    @Param('payment_id') paymentId: string,
  ) {
    // Delega a lógica para o serviço
    return this.paymentService.getPaymentDetails(paymentId);
  }
}