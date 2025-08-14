import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response, Request } from 'express';



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
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const { type, data } = req.body;

    console.log('--- Webhook Recebido ---');
    console.log('Tipo (type):', type);
    console.log('ID do pagamento:', data?.id);
    console.log('Corpo completo:', req.body);
    console.log('Cabeçalhos:', req.headers);
    console.log('------------------------');

    // Sempre responder ao Mercado Pago rapidamente
    res.sendStatus(HttpStatus.OK);

    // Processar somente eventos do tipo payment
    if (type === 'payment' && data?.id) {
      try {
        await this.paymentService.processWebhook(data.id, req.headers);
      } catch (err) {
        console.error('Erro ao processar webhook:', err);
      }
    }
  }

  @Post('status')
  async getPaymentStatus(
    @Body() body: {
      paymentId: string;
    },
  ) {
    return this.paymentService.getPaymentDetails(
      body.paymentId,
    );
  }

}