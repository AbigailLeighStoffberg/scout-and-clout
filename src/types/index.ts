// Core User Types
export type UserRole = 'merchant' | 'curator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  // Personal/Influencer images
  profile_pic?: string;
  cover_url?: string;
  // Partner/Business images
  partner_profile_pic?: string;
  partner_cover_url?: string;
  role: UserRole;
  roles?: UserRole[]; // Users can have multiple roles
  activeRole?: UserRole; // Currently active role for UI
  createdAt: Date;
}

export interface MerchantProfile extends User {
  role: 'merchant';
  businessName: string;
  business_name?: string; // API field alias
  businessCategory: DropCategory;
  location: Location;
  totalDrops: number;
  activeGuests: number;
  monthlyRedemptions: number;
}

export interface CuratorProfile extends User {
  role: 'curator';
  impactScore: number;
  level: CuratorLevel;
  totalFollowers: number;
  vibeListsCreated: number;
  missionsCompleted: number;
  referralCode: string;
}

// Drop System Types
export type DropCategory = 'eat' | 'stay' | 'play' | 'shop';
export type DropStatus = 'live' | 'scheduled' | 'expired' | 'draft';

export interface Drop {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  category: DropCategory;
  status: DropStatus;
  originalPrice: number;
  dropPrice: number;
  discount: number;
  remainingStock: number;
  totalStock: number;
  activeGuests: number;
  redemptions: number;
  startDate: Date;
  endDate: Date;
  location: Location;
  image?: string;
  tags: string[];
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

// Curator System Types
export type CuratorLevel = 'rookie' | 'explorer' | 'pathfinder' | 'trailblazer' | 'legendary';

export interface VibeList {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  theme: string;
  drops: Drop[];
  followers: number;
  views: number;
  saves: number;
  proTip?: string;
  createdAt: Date;
}

export interface CuratorMission {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  impactReward: number;
  deadline: Date;
  status: 'available' | 'accepted' | 'completed' | 'expired';
  category: DropCategory;
}

// Analytics Types
export interface AnalyticsData {
  totalGuests: number;
  totalRedemptions: number;
  revenue: number;
  conversionRate: number;
  topDrop?: Drop;
  dailyStats: DailyStat[];
  hourlyActivity: HourlyActivity[];
  guestRetention: GuestRetention;
}

export interface DailyStat {
  date: string;
  guests: number;
  redemptions: number;
  revenue: number;
}

export interface HourlyActivity {
  hour: number;
  guests: number;
  redemptions: number;
}

export interface GuestRetention {
  newGuests: number;
  returningGuests: number;
  retentionRate: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Activity Feed Types
export interface ActivityItem {
  id: string;
  type: 'claim' | 'follow' | 'save' | 'redeem' | 'mission';
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
}

// Hot Zone for Geo Map
export interface HotZone {
  id: string;
  location: Location;
  intensity: 'low' | 'medium' | 'high';
  guestCount: number;
}
