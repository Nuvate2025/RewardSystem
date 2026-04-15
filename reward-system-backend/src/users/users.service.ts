import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id },
      relations: { roles: { permissions: true } },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email },
      relations: { roles: { permissions: true } },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { phone },
    });
  }

  async createLocalUser(params: {
    email: string;
    passwordHash: string;
    phone?: string | null;
    roleIds?: string[];
  }): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: { email: params.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    if (params.phone) {
      const existingPhone = await this.usersRepo.findOne({
        where: { phone: params.phone },
      });
      if (existingPhone) throw new ConflictException('Phone already exists');
    }

    const user = this.usersRepo.create({
      email: params.email,
      phone: params.phone ?? null,
      passwordHash: params.passwordHash,
      roles: [],
    });

    // roles are assigned by caller (usually via RBAC service) after creation,
    // so keep this minimal to avoid circular dependency.
    return this.usersRepo.save(user);
  }

  async setRoles(userId: string, roles: User['roles']): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.roles = roles;
    return this.usersRepo.save(user);
  }

  /**
   * Same rules as the mobile app: required fields for a finished onboarding profile.
   * Used by GET /users/me/profile and can be mirrored on the client via `profileComplete`.
   */
  isProfileComplete(
    user: Pick<User, 'fullName' | 'deliveryAddress'> | null | undefined,
  ): boolean {
    if (!user) return false;
    return (
      Boolean(user.fullName?.trim()) && Boolean(user.deliveryAddress?.trim())
    );
  }

  private normalizeProfileText(
    value: string | null | undefined,
  ): string | null {
    if (value === undefined || value === null) return null;
    const t = value.trim();
    return t.length > 0 ? t : null;
  }

  async updateProfile(
    userId: string,
    patch: {
      fullName?: string | null;
      profession?: string | null;
      deliveryAddress?: string | null;
    },
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (patch.fullName !== undefined) {
      user.fullName = this.normalizeProfileText(patch.fullName);
    }
    if (patch.profession !== undefined) {
      user.profession = this.normalizeProfileText(patch.profession);
    }
    if (patch.deliveryAddress !== undefined) {
      user.deliveryAddress = this.normalizeProfileText(patch.deliveryAddress);
    }

    return this.usersRepo.save(user);
  }

  async setPinHash(userId: string, pinHash: string): Promise<void> {
    const res = await this.usersRepo.update({ id: userId }, { pinHash });
    if (!res.affected) throw new NotFoundException('User not found');
  }
}
