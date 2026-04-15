import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';
import { User } from '../users/entities/user.entity';
import { PointsService } from '../points/points.service';
import { randomBytes } from 'crypto';

@Injectable()
export class RewardsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Reward) private readonly rewardsRepo: Repository<Reward>,
    @InjectRepository(Redemption)
    private readonly redemptionsRepo: Repository<Redemption>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly points: PointsService,
  ) {}

  async list(params: { maxPoints?: number } = {}) {
    const where = { isActive: true } as const;
    const rewards = await this.rewardsRepo.find({
      where,
      order: { pointsCost: 'ASC', title: 'ASC' },
      take: 200,
    });
    if (params.maxPoints != null && Number.isFinite(params.maxPoints)) {
      return rewards.filter(
        (r) => r.pointsCost <= (params.maxPoints as number),
      );
    }
    return rewards;
  }

  async getById(id: string) {
    const reward = await this.rewardsRepo.findOne({
      where: { id, isActive: true },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async redeem(params: {
    userId: string;
    rewardId: string;
    deliveryLabel?: string | null;
    deliveryAddress?: string | null;
  }) {
    return this.dataSource.transaction(async (manager) => {
      const rewardsRepo = manager.getRepository(Reward);
      const usersRepo = manager.getRepository(User);
      const redemptionsRepo = manager.getRepository(Redemption);

      const user = await usersRepo.findOne({ where: { id: params.userId } });
      if (!user) throw new NotFoundException('User not found');

      const reward = await rewardsRepo.findOne({
        where: { id: params.rewardId, isActive: true },
      });
      if (!reward) throw new NotFoundException('Reward not found');

      // Debit points (creates transaction)
      await this.points.credit({
        userId: user.id,
        points: -reward.pointsCost,
        title: `Redeemed ${reward.title}`,
        site: null,
        type: 'REWARD_REDEEM',
      });

      const redemption = redemptionsRepo.create({
        trackingId: this.generateTrackingId(),
        user,
        reward,
        pointsCost: reward.pointsCost,
        deliveryLabel: params.deliveryLabel ?? null,
        deliveryAddress: params.deliveryAddress ?? null,
        status: 'PROCESSING',
        etaText: '5-7 Business Days',
      });
      const saved = await redemptionsRepo.save(redemption);

      return {
        status: saved.status,
        trackingId: saved.trackingId,
        eta: saved.etaText,
      };
    });
  }

  async listMyRedemptions(userId: string) {
    const rows = await this.redemptionsRepo.find({
      where: { user: { id: userId } },
      relations: { reward: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      trackingId: r.trackingId,
      pointsCost: r.pointsCost,
      deliveryLabel: r.deliveryLabel,
      deliveryAddress: r.deliveryAddress,
      status: r.status,
      etaText: r.etaText,
      createdAt: r.createdAt,
      reward: {
        id: r.reward?.id ?? null,
        title: r.reward?.title ?? null,
        description: r.reward?.description ?? null,
        pointsCost: r.reward?.pointsCost ?? 0,
      },
    }));
  }

  async cancelRedemption(params: { userId: string; redemptionId: string }) {
    const r = await this.redemptionsRepo.findOne({
      where: { id: params.redemptionId, user: { id: params.userId } },
    });
    if (!r) throw new NotFoundException('Redemption not found');
    if (r.status === 'CANCELLED') {
      throw new BadRequestException('Already cancelled');
    }
    if (r.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel a delivered order');
    }
    r.status = 'CANCELLED';
    const saved = await this.redemptionsRepo.save(r);
    return { id: saved.id, status: saved.status };
  }

  private generateTrackingId(): string {
    // Matches the "BB-88492" style from design (prefix + 5 digits).
    const digits = (randomBytes(3).readUIntBE(0, 3) % 90000) + 10000;
    return `BB-${digits}`;
  }
}
