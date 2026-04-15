import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RbacService } from './rbac.service';
import { UsersService } from '../users/users.service';

/**
 * Seeds initial roles + permissions so you can bootstrap the system
 * and still extend it later through RBAC APIs.
 */
@Injectable()
export class RbacSeeder implements OnModuleInit {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    private readonly rbac: RbacService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const permissions = [
      { key: 'rbac.manage', description: 'Manage roles and permissions' },
      { key: 'users.manage', description: 'Manage users and approve reward redemptions' },
      { key: 'coupons.manage', description: 'Generate and manage coupons (Superadmin only)' },
      { key: 'redemptions.deliver', description: 'Mark dispatched rewards as delivered to dealer' },
    ] as const;

    for (const p of permissions) {
      await this.rbac.upsertPermission(p.key, p.description);
    }

    await this.rbac.upsertRole({
      name: 'SUPERADMIN',
      description: 'Full system access',
      permissionKeys: permissions.map((p) => p.key),
    });
    await this.rbac.upsertRole({
      name: 'OPERATIONAL_ADMIN',
      description: 'Approve/reject redemptions and mark rewards as delivered to dealer',
      permissionKeys: ['users.manage', 'redemptions.deliver'],
    });
    await this.rbac.upsertRole({
      name: 'CUSTOMER',
      description: 'End user customer',
      permissionKeys: [],
    });
    await this.rbac.upsertRole({
      name: 'DEALER',
      description: 'End user dealer',
      permissionKeys: [],
    });

    await this.ensureSuperadminUser();
    await this.ensureDevPhoneSuperadmin();
    this.logger.log('RBAC seed ensured (roles + permissions).');
  }

  /**
   * Non-production only: ensures a phone + PIN superadmin for the mobile app
   * (same canonical phone as `AuthService.loginWithPin`: +91 +10 digits).
   * Override with DEV_ADMIN_PHONE / DEV_ADMIN_PIN.
   */
  private async ensureDevPhoneSuperadmin() {
    if (this.config.get<string>('NODE_ENV') === 'production') return;

    const digits = (
      this.config.get<string>('DEV_ADMIN_PHONE') ?? '9000000000'
    )
      .replace(/\D/g, '')
      .slice(0, 10);
    const pin = (
      this.config.get<string>('DEV_ADMIN_PIN') ?? '111111'
    )
      .replace(/\D/g, '')
      .slice(0, 6);
    if (digits.length !== 10 || pin.length !== 6) return;

    const fullPhone = `+91${digits}`;
    const email = `${fullPhone.replace(/\+/g, '')}@bestbonds.local`;

    const superadminRole = await this.rbac.getRoleByName('SUPERADMIN');
    if (!superadminRole) return;

    let user = await this.users.findByPhone(fullPhone);
    if (!user) {
      const emailTaken = await this.users.findByEmail(email);
      if (emailTaken) {
        this.logger.warn(
          `Dev phone superadmin skipped: ${email} already registered.`,
        );
        return;
      }
      const passwordHash = await bcrypt.hash(
        `${fullPhone}:${pin}:dev-bootstrap`,
        12,
      );
      user = await this.users.createLocalUser({
        email,
        passwordHash,
        phone: fullPhone,
      });
      this.logger.warn(
        `Bootstrapped dev phone SUPERADMIN (mobile PIN login). phone=${fullPhone}`,
      );
    }

    const pinHash = await bcrypt.hash(pin, 12);
    await this.users.setPinHash(user.id, pinHash);
    await this.users.setRoles(user.id, [superadminRole]);
    await this.users.updateProfile(user.id, {
      fullName: 'Superadmin',
      deliveryAddress: 'HQ',
    });
  }

  private async ensureSuperadminUser() {
    const email =
      this.config.get<string>('SUPERADMIN_EMAIL') ?? 'superadmin@example.com';
    const password =
      this.config.get<string>('SUPERADMIN_PASSWORD') ?? 'ChangeMe123!';

    const existing = await this.users.findByEmail(email);
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.users.createLocalUser({ email, passwordHash });

    const superadminRole = await this.rbac.getRoleByName('SUPERADMIN');
    if (superadminRole) {
      await this.users.setRoles(user.id, [superadminRole]);
    }

    this.logger.warn(
      `Bootstrapped SUPERADMIN user. email=${email} (set SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD to change)`,
    );
  }
}
