import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { randomBytes, randomUUID } from 'crypto';
import { PointsService } from '../points/points.service';
import { User } from '../users/entities/user.entity';
import type { FindOptionsWhere } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';

@Injectable()
export class CouponsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Coupon) private readonly couponsRepo: Repository<Coupon>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly points: PointsService,
  ) {}

  async generate(params: {
    createdByUserId: string;
    title: string;
    points: number;
    quantity: number;
    site?: string | null;
    expiresAt?: Date | null;
  }) {
    const createdBy = await this.usersRepo.findOne({
      where: { id: params.createdByUserId },
    });
    if (!createdBy) throw new NotFoundException('Creator user not found');

    const batchId = randomUUID();
    const raw = await this.couponsRepo
      .createQueryBuilder('c')
      .select('MAX(c.batchNumber)', 'max')
      .getRawOne<{ max: number | null }>();
    const batchNumber = Number(raw?.max ?? 0) + 1;

    const coupons: Coupon[] = [];
    for (let i = 0; i < params.quantity; i++) {
      coupons.push(
        this.couponsRepo.create({
          batchId,
          batchNumber,
          code: this.generateCode(),
          title: params.title,
          points: params.points,
          site: params.site ?? null,
          status: 'ACTIVE',
          expiresAt: params.expiresAt ?? null,
          createdBy,
          redeemedBy: null,
          redeemedAt: null,
        }),
      );
    }

    // Insert in one go
    const saved = await this.couponsRepo.save(coupons);
    const createdAt = saved[0]?.createdAt ?? new Date();
    const previewCodes = saved.slice(0, Math.min(20, saved.length)).map((c) => c.code);

    return {
      batchId,
      batchNumber,
      createdAt,
      quantity: saved.length,
      title: params.title,
      points: params.points,
      site: params.site ?? null,
      expiresAt: params.expiresAt ?? null,
      previewCodes,
      items: saved.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        points: c.points,
        site: c.site,
        status: c.status,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
        batchId: c.batchId,
        batchNumber: c.batchNumber,
      })),
    };
  }

  async list(params: { status?: string; take?: number }) {
    const take = params.take ?? 50;
    const where: FindOptionsWhere<Coupon> = params.status
      ? { status: params.status as Coupon['status'] }
      : {};
    return this.couponsRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: Math.max(1, Math.min(500, take)),
    });
  }

  async listBatches(params?: { take?: number; offset?: number }) {
    const take = Math.max(1, Math.min(100, Number(params?.take ?? 20)));
    const offset = Math.max(0, Math.min(10_000, Number(params?.offset ?? 0)));

    // SQLite grouping: pick min(createdAt) as createdAt and max(points/title/site/expiresAt) as representative.
    // All coupons in a batch share the same points/title/site/expiresAt from generation call.
    const qb = this.couponsRepo
      .createQueryBuilder('c')
      .select('c.batchId', 'batchId')
      .addSelect('MAX(c.batchNumber)', 'batchNumber')
      .addSelect('MIN(c.createdAt)', 'createdAt')
      .addSelect('COUNT(1)', 'totalCoupons')
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.status = :active THEN 1 ELSE 0 END), 0)',
        'activeCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.status = :redeemed THEN 1 ELSE 0 END), 0)',
        'redeemedCount',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN c.status = :expired THEN 1 ELSE 0 END), 0)',
        'expiredCount',
      )
      .addSelect('MAX(c.points)', 'points')
      .addSelect('MAX(c.title)', 'title')
      .addSelect('MAX(c.site)', 'site')
      .addSelect('MAX(c.expiresAt)', 'expiresAt')
      .where('c.batchId IS NOT NULL')
      .setParameters({ active: 'ACTIVE', redeemed: 'REDEEMED', expired: 'EXPIRED' })
      .groupBy('c.batchId')
      .orderBy('createdAt', 'DESC')
      .offset(offset)
      .limit(take);

    const rows = await qb.getRawMany<{
      batchId: string;
      batchNumber: string | number | null;
      createdAt: string;
      totalCoupons: string;
      activeCount: string;
      redeemedCount: string;
      expiredCount: string;
      points: string;
      title: string;
      site: string | null;
      expiresAt: string | null;
    }>();

    return {
      hasMore: rows.length === take,
      items: rows.map((r) => {
        const points = Number(r.points ?? 0);
        const totalCoupons = Number(r.totalCoupons ?? 0);
        return {
          batchId: r.batchId,
          batchNumber: r.batchNumber != null ? Number(r.batchNumber) : null,
          createdAt: r.createdAt,
          totalCoupons,
          totalValuePoints: points * totalCoupons,
          slabPoints: points,
          title: r.title,
          site: r.site ?? null,
          expiresAt: r.expiresAt ?? null,
          counts: {
            active: Number(r.activeCount ?? 0),
            redeemed: Number(r.redeemedCount ?? 0),
            expired: Number(r.expiredCount ?? 0),
          },
        };
      }),
    };
  }

  async listBatchCoupons(params: {
    batchId: string;
    status?: string;
    take?: number;
    offset?: number;
  }) {
    const take = Math.max(1, Math.min(500, Number(params.take ?? 50)));
    const offset = Math.max(0, Math.min(50_000, Number(params.offset ?? 0)));
    const batchId = params.batchId.trim();
    if (!batchId) throw new BadRequestException('Invalid batch id');

    const where: FindOptionsWhere<Coupon> = { batchId };
    if (params.status) where.status = params.status as Coupon['status'];

    const rows = await this.couponsRepo.find({
      where,
      order: { createdAt: 'ASC' },
      take,
      skip: offset,
    });
    return {
      hasMore: rows.length === take,
      items: rows.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        points: c.points,
        site: c.site,
        status: c.status,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
        batchId: c.batchId,
        batchNumber: c.batchNumber,
      })),
    };
  }

  async exportBatchPdf(params: { batchId: string }) {
    const batchId = params.batchId.trim();
    if (!batchId) throw new BadRequestException('Invalid batch id');

    const coupons = await this.couponsRepo.find({
      where: { batchId },
      order: { createdAt: 'ASC' },
      take: 50_000,
    });
    if (coupons.length === 0) throw new NotFoundException('Batch not found');

    const readFirstExisting = (paths: string[]) => {
      for (const p of paths) {
        try {
          if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
        } catch {
          /* try next */
        }
      }
      throw new NotFoundException(
        `Coupon export assets missing. Tried: ${paths.join(', ')}`,
      );
    };

    // Prefer backend-hosted design assets; fall back to app assets if needed.
    const backendAssetsDir = path.resolve(__dirname, '../frontend_assets/svgs');
    const backendRoot = path.resolve(__dirname, '../../..'); // <repo>/reward-system-backend
    const repoRoot = path.resolve(backendRoot, '..'); // <repo>
    const appAssetsDir = path.resolve(
      repoRoot,
      'RewardSystem',
      'RewardSystem',
      'src',
      'assets',
      'svgs',
      'originals',
    );

    const couponStepsSvg = readFirstExisting([
      path.join(backendAssetsDir, 'coupon_steps.svg'),
      path.join(appAssetsDir, 'coupon_steps.svg'),
    ]);
    const couponPhoneScanSvg = readFirstExisting([
      path.join(backendAssetsDir, 'coupon_phone_scan.svg'),
      path.join(appAssetsDir, 'coupon_phone_scan.svg'),
    ]);
    const bestBondSvg = readFirstExisting([
      path.join(backendAssetsDir, 'coupon_best_bond.svg'),
      path.join(appAssetsDir, 'best_bond.svg'),
    ]);

    const appDownloadUrl =
      process.env.APP_DOWNLOAD_URL ?? 'https://bestbond.example/app';
    const downloadQr = await QRCode.toDataURL(appDownloadUrl, {
      margin: 0,
      width: 180,
    });

    // Render at the exact design canvas size (660x245), then scale in mm for A4 (3 per page).
    const DESIGN_W = 660;
    const DESIGN_H = 245;
    const bannerWmm = 180;
    const bannerHmm = (bannerWmm * DESIGN_H) / DESIGN_W;

    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const fmtPoints = (n: number) =>
      n.toLocaleString('en-US', { maximumFractionDigits: 0 });

    const toSvgDataUri = (svg: string) => {
      const cleaned = svg
        .replace(/<\?xml[\s\S]*?\?>/g, '')
        .replace(/<!DOCTYPE[\s\S]*?>/g, '')
        .trim();
      const b64 = Buffer.from(cleaned, 'utf8').toString('base64');
      return `data:image/svg+xml;base64,${b64}`;
    };

    const couponStepsUri = toSvgDataUri(couponStepsSvg);
    const couponPhoneScanUri = toSvgDataUri(couponPhoneScanSvg);
    const bestBondUri = toSvgDataUri(bestBondSvg);

    const bannerSvgs: string[] = [];
    for (const c of coupons) {
      const code = String(c.code);
      const points = Number(c.points ?? 0);
      const qr = await QRCode.toDataURL(code, { margin: 0, width: 520 });

      // SVG layout tuned to match the provided coupon banner design (660x245).
      bannerSvgs.push(`
        <div class="banner" style="width:${bannerWmm}mm;height:${bannerHmm}mm;">
          <svg viewBox="0 0 ${DESIGN_W} ${DESIGN_H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Background + rounded corners -->
            <defs>
              <clipPath id="clip">
                <rect x="0" y="0" width="${DESIGN_W}" height="${DESIGN_H}" rx="26" ry="26" />
              </clipPath>
            </defs>
            <g clip-path="url(#clip)">
              <rect x="0" y="0" width="${DESIGN_W}" height="${DESIGN_H}" fill="#FFFFFF" />
              <rect x="${DESIGN_W / 2}" y="0" width="${DESIGN_W / 2}" height="${DESIGN_H}" fill="#1F2A37" />

              <!-- Left: phone scan icon -->
              <image href="${couponPhoneScanUri}" x="34" y="22" width="46" height="46" />

              <!-- Left: coupon QR -->
              <image href="${qr}" x="44" y="70" width="240" height="240" preserveAspectRatio="xMidYMid meet" />
              <!-- The QR needs to fit the left panel height; mask overflow -->
              <rect x="0" y="0" width="${DESIGN_W / 2}" height="${DESIGN_H}" fill="transparent" />

              <!-- Left: ID label -->
              <text x="${DESIGN_W / 4}" y="232" text-anchor="middle"
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                font-size="18" font-weight="700" fill="#6B7280">ID: ${escapeHtml(code)}</text>

              <!-- Right: BestBond logo top-right -->
              <image href="${bestBondUri}" x="597" y="18" width="48" height="48" preserveAspectRatio="xMidYMid meet" opacity="0.98" />

              <!-- Right: Redeem row -->
              <text x="350" y="70"
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                font-size="34" font-weight="800" fill="#FFFFFF">Redeem:</text>
              <rect x="482" y="40" width="220" height="62" rx="31" ry="31" fill="#F97316" />
              <text x="592" y="81" text-anchor="middle"
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                font-size="34" font-weight="900" fill="#FFFFFF">${escapeHtml(fmtPoints(points))} Points</text>

              <!-- Right: steps graphic -->
              <image href="${couponStepsUri}" x="360" y="98" width="250" height="124" preserveAspectRatio="xMidYMid meet" />

              <!-- Right: Download strip -->
              <rect x="606" y="56" width="44" height="156" rx="20" ry="20" fill="#FFFFFF" />
              <g transform="translate(628 134) rotate(-90)">
                <text x="0" y="0" text-anchor="middle"
                  font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
                  font-size="16" font-weight="700" fill="#1F2A37">Download the app</text>
              </g>
              <image href="${downloadQr}" x="612" y="166" width="32" height="32" preserveAspectRatio="xMidYMid meet" />
            </g>
          </svg>
        </div>
      `);
    }

    // 3 banners per page stacked vertically
    const pages: string[] = [];
    for (let i = 0; i < bannerSvgs.length; i += 3) {
      pages.push(`
        <div class="page">
          ${bannerSvgs.slice(i, i + 3).join('')}
        </div>
      `);
    }

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
            .page { page-break-after: always; display: flex; flex-direction: column; gap: 8mm; }
            .banner { display: block; border-radius: 10mm; overflow: hidden; }
          </style>
        </head>
        <body>
          ${pages.join('')}
        </body>
      </html>
    `;

    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
    const browser = await puppeteer.launch({
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      return pdf;
    } finally {
      await browser.close();
    }
  }

  async redeem(params: { userId: string; userRoles: string[]; code: string }) {
    const code = params.code.trim();
    if (!code) throw new BadRequestException('Invalid code');

    const roleNames = new Set((params.userRoles ?? []).map((r) => String(r).toUpperCase()));
    const isCustomer = roleNames.has('CUSTOMER');
    const isDealer = roleNames.has('DEALER');
    // Customers (and optionally dealers) can scan coupons; staff/admin must not.
    if (!isCustomer && !isDealer) {
      throw new ForbiddenException('Only customer accounts can redeem coupons');
    }

    return this.dataSource.transaction(async (manager) => {
      const couponRepo = manager.getRepository(Coupon);
      const userRepo = manager.getRepository(User);

      const coupon = await couponRepo.findOne({ where: { code } });
      if (!coupon) throw new NotFoundException('Coupon not found');

      if (coupon.status !== 'ACTIVE') {
        throw new ForbiddenException('Coupon already used or inactive');
      }

      if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
        coupon.status = 'EXPIRED';
        await couponRepo.save(coupon);
        throw new ForbiddenException('Coupon expired');
      }

      const user = await userRepo.findOne({ where: { id: params.userId } });
      if (!user) throw new NotFoundException('User not found');

      const redeemedAt = new Date();
      const reserve = await couponRepo
        .createQueryBuilder()
        .update(Coupon)
        .set({ status: 'REDEEMED', redeemedAt })
        .where('id = :id', { id: coupon.id })
        .andWhere('status = :active', { active: 'ACTIVE' })
        .execute();
      if (!reserve.affected) {
        throw new ForbiddenException('Coupon already used or inactive');
      }
      coupon.status = 'REDEEMED';
      coupon.redeemedBy = user;
      coupon.redeemedAt = redeemedAt;
      await couponRepo.save(coupon);

      // Credit points + create transaction record
      const result = await this.points.creditWithManager(manager, {
        userId: user.id,
        points: coupon.points,
        title: coupon.title,
        site: coupon.site,
        type: 'COUPON_SCAN',
      });

      return {
        pointsAdded: coupon.points,
        newTotalBalance: result.user.loyaltyPoints,
        title: coupon.title,
        site: coupon.site,
      };
    });
  }

  private generateCode(): string {
    // Short, user-friendly coupon code (uppercase hex).
    return randomBytes(6).toString('hex').toUpperCase(); // 12 chars
  }
}
