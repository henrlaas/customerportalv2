
export const TEAMS = [
  'Advisor',
  'Marketing',
  'Sales',
  'Advertiser',
  'Designer',
  'Branding',
  'Developer',
  'Other'
] as const;

export type TeamType = typeof TEAMS[number];

export const DEFAULT_TEAM = 'Other';
