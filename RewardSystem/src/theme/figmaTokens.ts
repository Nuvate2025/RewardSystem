/**
 * Design tokens extracted from figmadesign/ (SuperAdmin + User flows).
 * Use these for spacing, radii, and brand colors so screens stay aligned with Figma.
 */
export const figma = {
  brandOrange: '#EF8441',
  brandOrangeAlt: '#EF7D31',
  brandOrangeCTA: '#EB8338',
  /** Light app canvas (dashboard, lists) */
  screenMuted: '#F5F5F7',
  screenMutedAlt: '#F8F9FA',
  consumerHomeBg: '#F8F8F8',
  textTitle: '#111827',
  textBody: '#1A1C1E',
  textMuted: '#6B7280',
  textLabel: '#8E949A',
  roleAccent: '#D97738',
  suspend: '#C04E2E',
  success: '#2D8A39',
  successBg: '#E8F5E9',
  borderSoft: '#E8EAED',
  /** Engagement metric tiles */
  engageCardBg: '#EDF1F7',
  engageBadgeBg: '#E2E8F0',
  actionCardGlow: 'rgba(239, 132, 65, 0.2)',
  radiusScreenCard: 24,
  radiusHeroCard: 28,
  radiusLargeButton: 28,
  spaceGutter: 20,
  spaceSection: 24,
  shadowSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  shadowActionCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  shadowCta: {
    shadowColor: '#EF8441',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;
