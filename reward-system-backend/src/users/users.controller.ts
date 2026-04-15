import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth-user';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() req: Request) {
    return { user: (req.user as AuthUser | undefined) ?? null };
  }

  @Get('me/profile')
  async myProfile(@Req() req: Request) {
    const auth = req.user as AuthUser;
    const user = await this.users.findById(auth.id);
    const profileComplete = this.users.isProfileComplete(user);
    return {
      id: auth.id,
      email: auth.email,
      phone: user?.phone ?? null,
      fullName: user?.fullName ?? null,
      profession: user?.profession ?? null,
      deliveryAddress: user?.deliveryAddress ?? null,
      loyaltyPoints: user?.loyaltyPoints ?? 0,
      memberSinceYear: user?.createdAt ? user.createdAt.getFullYear() : null,
      profileComplete,
      roles: auth.roles,
      permissions: auth.permissions,
    };
  }

  @Put('me/profile')
  async updateMyProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const auth = req.user as AuthUser;
    const updated = await this.users.updateProfile(auth.id, {
      fullName: dto.fullName ?? undefined,
      profession: dto.profession ?? undefined,
      deliveryAddress: dto.deliveryAddress ?? undefined,
    });
    return {
      id: updated.id,
      email: updated.email,
      phone: updated.phone,
      fullName: updated.fullName,
      profession: updated.profession,
      deliveryAddress: updated.deliveryAddress,
      loyaltyPoints: updated.loyaltyPoints,
      memberSinceYear: updated.createdAt.getFullYear(),
      profileComplete: this.users.isProfileComplete(updated),
      roles: auth.roles,
      permissions: auth.permissions,
    };
  }
}
