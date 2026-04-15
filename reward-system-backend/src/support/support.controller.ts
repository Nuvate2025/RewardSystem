import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('support')
export class SupportController {
  @Public()
  @Get()
  getSupport() {
    return {
      /** E.164-style for tel: links */
      phone: '+18005550199',
      /** Digits only (no +) for https://wa.me/{whatsapp} */
      whatsapp: '15551234567',
      email: 'contactsupport@gmail.com',
      availability: '24/7',
    };
  }
}
