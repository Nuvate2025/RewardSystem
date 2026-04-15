import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth-user';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CouponsService } from './coupons.service';
import { GenerateCouponsDto } from './dto/generate-coupons.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  /**
   * Ops Admin/Superadmin: generate coupons in bulk.
   */
  @Post('generate')
  @RequirePermissions('coupons.manage')
  generate(@Req() req: Request, @Body() dto: GenerateCouponsDto) {
    const user = req.user as AuthUser;
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    return this.coupons.generate({
      createdByUserId: user.id,
      title: dto.title,
      points: dto.points,
      quantity: dto.quantity,
      site: dto.site ?? null,
      expiresAt:
        expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    });
  }

  /**
   * Ops Admin/Superadmin: list coupons.
   */
  @Get()
  @RequirePermissions('coupons.manage')
  list(@Query('status') status?: string, @Query('take') take?: string) {
    const n = take ? Number(take) : 50;
    return this.coupons.list({ status, take: Number.isFinite(n) ? n : 50 });
  }

  /**
   * Customer/Dealer: redeem a coupon by scanned/manual code entry.
   */
  @Post('redeem')
  redeem(@Req() req: Request, @Body() dto: RedeemCouponDto) {
    const user = req.user as AuthUser;
    return this.coupons.redeem({ userId: user.id, code: dto.code });
  }
}
