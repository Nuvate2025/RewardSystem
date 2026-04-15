import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RbacService } from '../rbac/rbac.service';
import { OtpCode } from './entities/otp-code.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly rbac: RbacService,
    private readonly jwt: JwtService,
    @InjectRepository(OtpCode)
    private readonly otpRepo: Repository<OtpCode>,
  ) {}

  async register(params: {
    email: string;
    password: string;
    roleName?: 'CUSTOMER' | 'DEALER';
  }) {
    const passwordHash = await bcrypt.hash(params.password, 12);
    const user = await this.users.createLocalUser({
      email: params.email,
      passwordHash,
    });

    const roleName = params.roleName ?? 'CUSTOMER';
    const role = await this.rbac.getRoleByName(roleName);
    if (role) {
      await this.users.setRoles(user.id, [role]);
    }

    return this.login({ email: params.email, password: params.password });
  }

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(params: { email: string; password: string }) {
    const user = await this.validateUser(params.email, params.password);
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
    };
  }

  /**
   * Mobile flow: request OTP for a phone number. In production you'd integrate SMS provider.
   */
  async requestOtp(params: { phone: string; countryCode: string }) {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const rec = this.otpRepo.create({
      phone: `${params.countryCode}${params.phone}`,
      codeHash,
      expiresAt,
      consumedAt: null,
    });
    const saved = await this.otpRepo.save(rec);

    return {
      requestId: saved.id,
      otpSent: true,
      ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
    };
  }

  async verifyOtp(params: { phone: string; countryCode: string; code: string }) {
    const fullPhone = `${params.countryCode}${params.phone}`;
    const latest = await this.otpRepo.findOne({
      where: { phone: fullPhone },
      order: { createdAt: 'DESC' },
    });
    if (!latest || latest.consumedAt) {
      throw new UnauthorizedException('OTP not found');
    }
    if (latest.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('OTP expired');
    }
    const ok = await bcrypt.compare(params.code, latest.codeHash);
    if (!ok) throw new UnauthorizedException('Invalid OTP');

    latest.consumedAt = new Date();
    await this.otpRepo.save(latest);

    // find/create user bound to this phone
    let user = await this.users.findByPhone(fullPhone);
    if (!user) {
      // deterministic email to satisfy existing schema
      const email = `${fullPhone.replace(/\+/g, '')}@bestbonds.local`;
      user = await this.users.createLocalUser({
        email,
        phone: fullPhone,
        passwordHash: await bcrypt.hash(`${fullPhone}:${Date.now()}`, 8),
      });
    }

    const verificationToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, purpose: 'PIN_SETUP' },
      { expiresIn: '10m' },
    );

    return { verificationToken };
  }

  private authSnapshot(user: User | null) {
    if (!user) {
      return { roles: [] as string[], permissions: [] as string[] };
    }
    const roles = (user.roles ?? []).map((r) => r.name);
    const permissions = Array.from(
      new Set(
        (user.roles ?? []).flatMap((r) =>
          (r.permissions ?? []).map((p) => p.key),
        ),
      ),
    );
    return { roles, permissions };
  }

  async setPin(params: { verificationToken: string; pin: string }) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(params.verificationToken);
    } catch {
      throw new UnauthorizedException('Invalid verification token');
    }
    if (payload?.purpose !== 'PIN_SETUP' || !payload?.sub) {
      throw new UnauthorizedException('Invalid verification token');
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();

    const pinPlain = String(params.pin).replace(/\D/g, '').slice(0, 6);
    const pinHash = await bcrypt.hash(pinPlain, 12);
    await this.users.setPinHash(user.id, pinHash);

    const loaded = await this.users.findById(user.id);
    const snap = this.authSnapshot(loaded);

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      roles: snap.roles,
      permissions: snap.permissions,
    };
  }

  async loginWithPin(params: { phone: string; pin: string }) {
    // Same canonical key as verifyOtp (`countryCode` + national digits), e.g. +919876543210.
    // Keep in sync with mobile signup default country (+91).
    const fullPhone = `+91${String(params.phone).replace(/\D/g, '').slice(0, 10)}`;
    const pinPlain = String(params.pin).replace(/\D/g, '').slice(0, 6);
    const user = await this.users.findByPhone(fullPhone);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    if (!user.pinHash) throw new UnauthorizedException('PIN not set');

    const ok = await bcrypt.compare(pinPlain, user.pinHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const loaded = await this.users.findById(user.id);
    const snap = this.authSnapshot(loaded);

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      roles: snap.roles,
      permissions: snap.permissions,
    };
  }
}
