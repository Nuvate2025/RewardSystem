import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Reward) private readonly repo: Repository<Reward>,
  ) {}

  async onModuleInit() {
    // Minimal set based on screenshots. Images can be wired later.
    await this.upsert({
      title: 'Levelling System',
      description:
        'Heavy-duty 18V brushless motor with 3 modes and hard-case carry set.',
      pointsCost: 5000,
      imageUrl: null,
    });
    await this.upsert({
      title: 'Industrial Putty Mixer Machine',
      description:
        'Heavy-duty 50L capacity professional grade motor with variable speed control and stainless steel construction.',
      pointsCost: 8500,
      imageUrl: null,
    });
  }

  private async upsert(params: {
    title: string;
    description: string | null;
    pointsCost: number;
    imageUrl: string | null;
  }) {
    const existing = await this.repo.findOne({
      where: { title: params.title },
    });
    if (existing) {
      existing.description = params.description;
      existing.pointsCost = params.pointsCost;
      existing.imageUrl = params.imageUrl;
      existing.isActive = true;
      await this.repo.save(existing);
      return;
    }
    await this.repo.save(
      this.repo.create({
        title: params.title,
        description: params.description,
        pointsCost: params.pointsCost,
        imageUrl: params.imageUrl,
        isActive: true,
      }),
    );
  }
}
