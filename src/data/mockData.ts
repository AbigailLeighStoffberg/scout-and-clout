import type {
  Drop,
  MerchantProfile,
  CuratorProfile,
  VibeList,
  CuratorMission,
  AnalyticsData,
  ActivityItem,
  HotZone,
} from '@/types';

// Mock Merchant Profile
export const mockMerchant: MerchantProfile = {
  id: 'merchant-001',
  email: 'hello@tastybites.com',
  name: 'Sarah Chen',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  role: 'merchant',
  businessName: 'Tasty Bites Café',
  businessCategory: 'eat',
  location: {
    lat: 34.0522,
    lng: -118.2437,
    address: '456 Flavor St',
    city: 'Los Angeles',
    state: 'CA',
  },
  totalDrops: 24,
  activeGuests: 847,
  monthlyRedemptions: 1243,
  createdAt: new Date('2024-01-15'),
};

// Mock Curator Profile
export const mockCurator: CuratorProfile = {
  id: 'curator-001',
  email: 'alex@vibecheck.app',
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  role: 'curator',
  impactScore: 27500,
  level: 'trailblazer',
  totalFollowers: 8934,
  vibeListsCreated: 15,
  missionsCompleted: 32,
  referralCode: 'ALEXVIBE2024',
  createdAt: new Date('2023-08-20'),
};

// Legacy alias for compatibility
export const mockScout = mockCurator;

// Mock Active Drops
export const mockDrops: Drop[] = [
  {
    id: 'drop-001',
    merchantId: 'merchant-001',
    title: 'Happy Hour Madness',
    description: 'Get 50% off all craft cocktails and appetizers from 5-7 PM!',
    category: 'eat',
    status: 'live',
    originalPrice: 45,
    dropPrice: 22.5,
    discount: 50,
    remainingStock: 47,
    totalStock: 100,
    activeGuests: 156,
    redemptions: 53,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: mockMerchant.location,
    tags: ['cocktails', 'happy-hour', 'appetizers'],
    createdAt: new Date(),
  },
  {
    id: 'drop-002',
    merchantId: 'merchant-001',
    title: 'Weekend Brunch Special',
    description: 'Unlimited mimosas with any brunch entrée purchase!',
    category: 'eat',
    status: 'scheduled',
    originalPrice: 35,
    dropPrice: 25,
    discount: 29,
    remainingStock: 80,
    totalStock: 80,
    activeGuests: 0,
    redemptions: 0,
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    location: mockMerchant.location,
    tags: ['brunch', 'mimosas', 'weekend'],
    createdAt: new Date(),
  },
  {
    id: 'drop-003',
    merchantId: 'merchant-001',
    title: 'Coffee Lover Bundle',
    description: 'Buy any coffee, get a free pastry of your choice.',
    category: 'eat',
    status: 'live',
    originalPrice: 12,
    dropPrice: 6,
    discount: 50,
    remainingStock: 23,
    totalStock: 50,
    activeGuests: 89,
    redemptions: 27,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: mockMerchant.location,
    tags: ['coffee', 'pastry', 'morning'],
    createdAt: new Date(),
  },
  {
    id: 'drop-004',
    merchantId: 'merchant-002',
    title: 'Escape Room Challenge',
    description: 'Book any escape room and get 40% off for groups of 4+',
    category: 'play',
    status: 'live',
    originalPrice: 120,
    dropPrice: 72,
    discount: 40,
    remainingStock: 15,
    totalStock: 30,
    activeGuests: 234,
    redemptions: 15,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: {
      lat: 34.0195,
      lng: -118.4912,
      address: '789 Adventure Blvd',
      city: 'Santa Monica',
      state: 'CA',
    },
    tags: ['escape-room', 'group', 'adventure'],
    createdAt: new Date(),
  },
];

// Mock VibeLists
export const mockVibeLists: VibeList[] = [
  {
    id: 'vlist-001',
    curatorId: 'curator-001',
    title: 'Downtown Foodie Trail',
    description: 'The ultimate food adventure through LA\'s hidden gems',
    theme: 'foodie',
    drops: mockDrops.filter(d => d.category === 'eat'),
    followers: 2341,
    views: 15678,
    saves: 892,
    proTip: 'Start at Happy Hour Madness for the best cocktails, then walk two blocks to the Coffee Lover spot!',
    createdAt: new Date('2024-10-01'),
  },
  {
    id: 'vlist-002',
    curatorId: 'curator-001',
    title: 'Date Night Essentials',
    description: 'Impress your special someone with these romantic spots',
    theme: 'romantic',
    drops: mockDrops.slice(0, 2),
    followers: 1567,
    views: 8934,
    saves: 567,
    proTip: 'Book reservations early - these spots fill up fast on weekends!',
    createdAt: new Date('2024-09-15'),
  },
];

// Mock Curator Missions
export const mockMissions: CuratorMission[] = [
  {
    id: 'mission-001',
    merchantId: 'merchant-001',
    merchantName: 'Tasty Bites Café',
    title: 'Promote Our New Brunch Menu',
    description: 'Create engaging content showcasing our new weekend brunch offerings. Share on Instagram and TikTok.',
    impactReward: 500,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'available',
    category: 'eat',
  },
  {
    id: 'mission-002',
    merchantId: 'merchant-003',
    merchantName: 'Urban Escape Rooms',
    title: 'Escape Room Experience Video',
    description: 'Film your escape room experience and post a highlight reel. Minimum 60 seconds.',
    impactReward: 750,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'available',
    category: 'play',
  },
  {
    id: 'mission-003',
    merchantId: 'merchant-004',
    merchantName: 'Boutique Hotel LA',
    title: 'Staycation Story',
    description: 'Document a night at our boutique hotel. Show off the amenities and room views.',
    impactReward: 1000,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    status: 'accepted',
    category: 'stay',
  },
];

// Mock Analytics
export const mockAnalytics: AnalyticsData = {
  totalGuests: 847,
  totalRedemptions: 1243,
  revenue: 28450,
  conversionRate: 68.5,
  topDrop: mockDrops[0],
  dailyStats: [
    { date: '2024-12-20', guests: 120, redemptions: 45, revenue: 1125 },
    { date: '2024-12-21', guests: 145, redemptions: 62, revenue: 1550 },
    { date: '2024-12-22', guests: 189, redemptions: 78, revenue: 1950 },
    { date: '2024-12-23', guests: 156, redemptions: 89, revenue: 2225 },
    { date: '2024-12-24', guests: 234, redemptions: 145, revenue: 3625 },
    { date: '2024-12-25', guests: 178, redemptions: 98, revenue: 2450 },
    { date: '2024-12-26', guests: 201, redemptions: 112, revenue: 2800 },
  ],
  hourlyActivity: [
    { hour: 0, guests: 12, redemptions: 3 },
    { hour: 1, guests: 8, redemptions: 2 },
    { hour: 2, guests: 5, redemptions: 1 },
    { hour: 3, guests: 3, redemptions: 0 },
    { hour: 4, guests: 4, redemptions: 1 },
    { hour: 5, guests: 8, redemptions: 2 },
    { hour: 6, guests: 25, redemptions: 8 },
    { hour: 7, guests: 45, redemptions: 15 },
    { hour: 8, guests: 67, redemptions: 24 },
    { hour: 9, guests: 78, redemptions: 32 },
    { hour: 10, guests: 89, redemptions: 38 },
    { hour: 11, guests: 95, redemptions: 42 },
    { hour: 12, guests: 120, redemptions: 56 },
    { hour: 13, guests: 98, redemptions: 45 },
    { hour: 14, guests: 85, redemptions: 38 },
    { hour: 15, guests: 92, redemptions: 41 },
    { hour: 16, guests: 110, redemptions: 52 },
    { hour: 17, guests: 145, redemptions: 68 },
    { hour: 18, guests: 156, redemptions: 72 },
    { hour: 19, guests: 134, redemptions: 62 },
    { hour: 20, guests: 112, redemptions: 48 },
    { hour: 21, guests: 78, redemptions: 32 },
    { hour: 22, guests: 45, redemptions: 18 },
    { hour: 23, guests: 28, redemptions: 10 },
  ],
  guestRetention: {
    newGuests: 324,
    returningGuests: 523,
    retentionRate: 61.7,
  },
};

// Mock Activity Feed
export const mockActivity: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'claim',
    user: { name: 'Jamie K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50' },
    action: 'claimed',
    target: 'Happy Hour Madness',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'act-002',
    type: 'follow',
    user: { name: 'Morgan T.' },
    action: 'started following your VibeList',
    target: 'Downtown Foodie Trail',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'act-003',
    type: 'save',
    user: { name: 'Casey L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50' },
    action: 'saved',
    target: 'Date Night Essentials',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: 'act-004',
    type: 'redeem',
    user: { name: 'Jordan P.' },
    action: 'redeemed',
    target: 'Coffee Lover Bundle',
    timestamp: new Date(Date.now() - 23 * 60 * 1000),
  },
  {
    id: 'act-005',
    type: 'claim',
    user: { name: 'Riley S.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50' },
    action: 'claimed',
    target: 'Happy Hour Madness',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
  },
];

// Mock Hot Zones
export const mockHotZones: HotZone[] = [
  {
    id: 'zone-001',
    location: { lat: 34.0522, lng: -118.2437, address: '456 Flavor St', city: 'Los Angeles', state: 'CA' },
    intensity: 'high',
    guestCount: 156,
  },
  {
    id: 'zone-002',
    location: { lat: 34.0489, lng: -118.2500, address: '123 Main St', city: 'Los Angeles', state: 'CA' },
    intensity: 'medium',
    guestCount: 78,
  },
  {
    id: 'zone-003',
    location: { lat: 34.0550, lng: -118.2380, address: '789 Oak Ave', city: 'Los Angeles', state: 'CA' },
    intensity: 'low',
    guestCount: 23,
  },
];

// AI Suggestions for Drop Creation
export const mockAISuggestions = {
  eat: {
    titles: ['Happy Hour Madness', 'Taste of Paradise', 'Flavor Fusion Friday'],
    descriptions: [
      'Savor the moment with exclusive deals that\'ll make your taste buds dance! 🍽️✨',
      'Your culinary adventure awaits – grab this limited-time treat before it\'s gone! 🔥',
    ],
    bestTimes: 'Thursday 5-7 PM or Friday 6-8 PM shows 45% higher engagement',
  },
  play: {
    titles: ['Adventure Awaits', 'Game On Special', 'Thrill Seeker Package'],
    descriptions: [
      'Ready for an unforgettable experience? This is your moment! 🎮🎯',
      'Gather the squad and unlock epic savings on your next adventure! 🚀',
    ],
    bestTimes: 'Saturday 2-5 PM or Sunday afternoon peaks at 62% conversion',
  },
  stay: {
    titles: ['Staycation Dreams', 'Escape & Unwind', 'Luxury for Less'],
    descriptions: [
      'Your perfect escape is just a tap away – indulge without the guilt! 🏨✨',
      'Make memories in style with this exclusive accommodation deal! 🌟',
    ],
    bestTimes: 'Wednesday-Thursday bookings see 38% more redemptions',
  },
  shop: {
    titles: ['Flash Fashion Drop', 'Style Steals', 'Limited Edition Loot'],
    descriptions: [
      'Score exclusive finds before they\'re gone! Limited stock alert! 🛍️🔥',
      'Your wardrobe (and wallet) will thank you – grab it now! ✨',
    ],
    bestTimes: 'Friday evening or Sunday afternoon drives 52% more traffic',
  },
};
