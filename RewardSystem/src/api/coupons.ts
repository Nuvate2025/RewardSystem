import { apiPost } from './client';

export type RedeemCouponResponse = {
  pointsAdded: number;
  newTotalBalance: number;
  title: string;
  site: string | null;
};

export async function redeemCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  return apiPost<RedeemCouponResponse>('/coupons/redeem', { code: normalized });
}

export type GeneratedCouponItem = {
  id: string;
  code: string;
  title: string;
  points: number;
  status: string;
  createdAt: string;
};

export async function generateCouponBatch(params: {
  points: number;
  quantity: number;
  title?: string;
  site?: string;
  expiresAt?: string;
}) {
  const title =
    params.title ??
    `Coupon Batch – ${params.points.toLocaleString()} pts × ${params.quantity}`;
  return apiPost<GeneratedCouponItem[]>('/coupons/generate', {
    title,
    points: params.points,
    quantity: params.quantity,
    ...(params.site ? { site: params.site } : {}),
    ...(params.expiresAt ? { expiresAt: params.expiresAt } : {}),
  });
}
