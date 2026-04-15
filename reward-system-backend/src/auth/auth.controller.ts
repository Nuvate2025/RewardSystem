import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { PinLoginDto } from './dto/pin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register({
      email: dto.email,
      password: dto.password,
      roleName: dto.role,
    });
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Mobile: request OTP to verify phone */
  @Public()
  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp({ phone: dto.phone, countryCode: dto.countryCode });
  }

  /** Mobile: verify OTP and receive a PIN setup token */
  @Public()
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp({
      phone: dto.phone,
      countryCode: dto.countryCode,
      code: dto.code,
    });
  }

  /** Mobile: set 6-digit PIN using verification token from OTP */
  @Public()
  @Post('pin/set')
  setPin(@Body() dto: SetPinDto) {
    return this.auth.setPin({ verificationToken: dto.verificationToken, pin: dto.pin });
  }

  /** Mobile: login with 6-digit PIN (phone is stored client-side) */
  @Public()
  @Post('pin/login')
  loginWithPin(@Body() dto: PinLoginDto) {
    return this.auth.loginWithPin({ phone: dto.phone, pin: dto.pin });
  }
}
