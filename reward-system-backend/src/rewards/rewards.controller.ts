import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth-user';
import { RewardsService } from './rewards.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get()
  list(@Query('maxPoints') maxPoints?: string) {
    const n = maxPoints ? Number(maxPoints) : undefined;
    return this.rewards.list({
      maxPoints: Number.isFinite(n as number) ? (n as number) : undefined,
    });
  }

  /** Static path must be registered before `:id` so it is not captured as an id. */
  @Get('me/redemptions')
  myRedemptions(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.rewards.listMyRedemptions(user.id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.rewards.getById(id);
  }

  @Post(':id/redeem')
  redeem(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateRedemptionDto,
  ) {
    const user = req.user as AuthUser;
    return this.rewards.redeem({
      userId: user.id,
      rewardId: id,
      deliveryLabel: dto.deliveryLabel ?? null,
      deliveryAddress: dto.deliveryAddress ?? null,
    });
  }

  /** Consumer: cancel a pending redemption (Delivery Status screen). */
  @Delete('me/redemptions/:redemptionId/cancel')
  cancelRedemption(
    @Req() req: Request,
    @Param('redemptionId') redemptionId: string,
  ) {
    const user = req.user as AuthUser;
    return this.rewards.cancelRedemption({ userId: user.id, redemptionId });
  }
}
