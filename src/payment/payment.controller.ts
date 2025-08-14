import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response, Request } from 'express';
import { PaymentStatusDto } from './dto/payment-status.dto';



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


    if (type === 'payment' && data?.id) {
      try {
        await this.paymentService.processWebhook(data.id, req.headers);
        res.sendStatus(HttpStatus.OK);
      } catch (err) {
        console.error('Erro ao processar webhook:', err);
        res.sendStatus(HttpStatus.BAD_REQUEST);
      }
    }
  }

  @Post('status')
  async getPaymentStatus(
    @Body() dto: PaymentStatusDto
  ) {
    return this.paymentService.getPaymentDetails(dto.paymentId);
  }

}