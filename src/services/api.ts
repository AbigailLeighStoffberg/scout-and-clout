// API Service for VibeCheck PHP Backend
const BASE_URL = 'https://vibecheck-api.atwebpages.com/api.php';
const API_ORIGIN = new URL(BASE_URL).origin;
const API_ROOT = `${API_ORIGIN}/`;

export function toAbsoluteUrl(url: string): string {
  try {
    return new URL(url, API_ROOT).toString();
  } catch {
    return url;
  }
}

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: ('merchant' | 'influencer')[] | 'merchant' | 'influencer';
  username?: string;
  business_name?: string;
  profile_pic?: string;
  cover_url?: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: 'merchant' | 'influencer';
  avatar?: string;
  profile_pic?: string;
  cover_url?: string;
  business_name?: string;
  created_at: string;
}

interface DropData {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  category: 'eat' | 'stay' | 'play' | 'shop';
  status: 'live' | 'scheduled' | 'expired' | 'draft';
  original_price: number;
  drop_price: number;
  discount: number;
  remaining_stock: number;
  total_stock: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  image_url?: string;
  start_date: string;
  end_date: string;
}

interface QuestData {
  id: string;
  merchant_id: string;
  merchant_name: string;
  title: string;
  description: string;
  impact_reward: number;
  deadline: string;
  status: 'available' | 'accepted' | 'completed' | 'expired';
  category: 'eat' | 'stay' | 'play' | 'shop';
}

interface CampaignData {
  id?: string;
  partner_id: number;
  title: string;
  description: string;
  type: 'drop' | 'mission';
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  reward_points?: number;
  mission_action?: string;
  image_url?: string;
  media_url?: string;
  // Drop-specific fields
  reward_text?: string;
  condition_text?: string;
  // Mission-specific fields
  commission_details?: string;
}

interface CampaignMetrics {
  campaign_id: string;
  revenue: number;
  scans: number;
  views: number;
}

// Helper to handle fetch with error handling
// Normalizes PHP API response (status/message) to our expected format (success/error)
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

    // Normalize PHP API response format to our expected format
    // PHP commonly returns: { status: "success"|"error", message?: string, data?: any, ... }
    const isSuccess = rawData.status === "success";

    if (isSuccess) {
      // If backend returns a dedicated `data` envelope, use it.
      // Example: { status: "success", data: [...] }
      if (Object.prototype.hasOwnProperty.call(rawData, "data")) {
        return {
          success: true,
          data: rawData.data as T,
          message: rawData.message,
        };
      }

      // Otherwise treat remaining fields as the payload (e.g., user_id from register).
      const { status, message, ...payload } = rawData;
      return {
        success: true,
        data: payload as T,
        message: message,
      };
    }

    return {
      success: false,
      error: rawData.message || "Operation failed",
    };
  } catch (error) {
    console.error('API Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    // `Failed to fetch` is almost always: CORS blocked, DNS/SSL issue, or backend down.
    if (typeof message === 'string' && message.toLowerCase().includes('failed to fetch')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return {
        success: false,
        error: `Failed to reach API (CORS / server offline). Your site origin is ${origin}. Ensure your PHP api.php sends Access-Control-Allow-Origin for this origin (and handles OPTIONS) and that ${API_ORIGIN} is reachable.`,
      };
    }

    return {
      success: false,
      error: message,
    };
  }
}

// API Methods
export const api = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<ApiResponse<UserData>> => {
    return fetchApi<UserData>(`${BASE_URL}?action=login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<ApiResponse<UserData>> => {
    return fetchApi<UserData>(`${BASE_URL}?action=register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Add a new role to an existing user account
  addRole: async (data: { user_id: string; email: string; role: 'merchant' | 'influencer'; business_name?: string }): Promise<ApiResponse<UserData>> => {
    return fetchApi<UserData>(`${BASE_URL}?action=add_role`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Drops
  getDrops: async (): Promise<ApiResponse<DropData[]>> => {
    return fetchApi<DropData[]>(`${BASE_URL}?action=get_drops`, {
      method: 'GET',
    });
  },

  getMyDrops: async (partnerId: string): Promise<ApiResponse<DropData[]>> => {
    return fetchApi<DropData[]>(`${BASE_URL}?action=get_my_drops&partner_id=${partnerId}`, {
      method: 'GET',
    });
  },

  createDrop: async (dropData: Partial<DropData>): Promise<ApiResponse<DropData>> => {
    return fetchApi<DropData>(`${BASE_URL}?action=create_drop`, {
      method: 'POST',
      body: JSON.stringify(dropData),
    });
  },

  // Quests/Missions
  getQuests: async (): Promise<ApiResponse<QuestData[]>> => {
    return fetchApi<QuestData[]>(`${BASE_URL}?action=get_quests`, {
      method: 'GET',
    });
  },

  createQuest: async (questData: { title: string; description: string; steps: Array<{ drop_id: string; order: number }> }): Promise<ApiResponse<QuestData>> => {
    return fetchApi<QuestData>(`${BASE_URL}?action=create_vibelist`, {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  },

  acceptQuest: async (questId: string, userId: string): Promise<ApiResponse<QuestData>> => {
    return fetchApi<QuestData>(`${BASE_URL}?action=accept_quest`, {
      method: 'POST',
      body: JSON.stringify({ quest_id: questId, user_id: userId }),
    });
  },

  // Earnings
  getEarnings: async (userId: string): Promise<ApiResponse<{ total_balance: number; monthly: Array<{ month: string; earnings: number }> }>> => {
    return fetchApi<{ total_balance: number; monthly: Array<{ month: string; earnings: number }> }>(`${BASE_URL}?action=get_earnings&user_id=${userId}`, {
      method: 'GET',
    });
  },

  // Analytics (future)
  getAnalytics: async (merchantId: string): Promise<ApiResponse<unknown>> => {
    return fetchApi<unknown>(`${BASE_URL}?action=get_analytics&merchant_id=${merchantId}`, {
      method: 'GET',
    });
  },

  // Partner Dashboard
  getPartnerDashboard: async (userId: string): Promise<ApiResponse<{
    chart_data: Array<{ date?: string; name?: string; rev?: number; revenue?: number; scans: number }>;
    traffic_sources: Array<{ name: string; value: number; percentage?: number }>;
    top_influencers: Array<{ id: number; name: string; avatar: string; traffic: number; sales: number; revenue: number; trend: number; conversion_rate?: number }>;
    today_scans?: number;
  }>> => {
    return fetchApi(`${BASE_URL}?action=get_partner_dashboard&user_id=${userId}`, {
      method: 'GET',
    });
  },

  // Influencer Dashboard
  getInfluencerDashboard: async (userId: string): Promise<ApiResponse<{
    earnings_chart?: Array<{ month: string; earnings?: number; total?: string }>;
    monthly_breakdown?: Array<{ month: string; total: string }>;
    gig_history?: Array<{ id: number; name: string; status: string; reward: string; date: string }>;
    gig_rewards?: Array<{ gig_name: string; status: string; reward: string; date: string }>;
    total_balance?: number;
    available_balance?: number;
    balance?: number;
    published_quest_lines?: Array<any>;
  }>> => {
    return fetchApi(`${BASE_URL}?action=get_influencer_dashboard&user_id=${userId}`, {
      method: 'GET',
    });
  },

  // Campaigns
  createCampaign: async (campaignData: CampaignData): Promise<ApiResponse<{ campaign_id: string }>> => {
    return fetchApi<{ campaign_id: string }>(`${BASE_URL}?action=create_campaign`, {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  },

  getCampaigns: async (partnerId: number): Promise<ApiResponse<CampaignData[]>> => {
    return fetchApi<CampaignData[]>(`${BASE_URL}?action=get_campaigns&partner_id=${partnerId}`, {
      method: 'GET',
    });
  },

  getCampaignMetrics: async (campaignId: string): Promise<ApiResponse<CampaignMetrics>> => {
    return fetchApi<CampaignMetrics>(`${BASE_URL}?action=get_campaign_metrics&campaign_id=${campaignId}`, {
      method: 'GET',
    });
  },

  // Delete a campaign
  deleteCampaign: async (campaignId: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    return fetchApi<{ deleted: boolean }>(`${BASE_URL}?action=delete_campaign`, {
      method: 'POST',
      body: JSON.stringify({ id: campaignId }),
    });
  },

  // Update a campaign
  updateCampaign: async (campaignId: string, updates: Partial<CampaignData>): Promise<ApiResponse<{ updated: boolean }>> => {
    return fetchApi<{ updated: boolean }>(`${BASE_URL}?action=update_campaign`, {
      method: 'POST',
      body: JSON.stringify({ id: campaignId, ...updates }),
    });
  },

  // Update user profile (profile_pic, cover_url, etc.)
  updateUser: async (userId: string, updates: { profile_pic?: string; cover_url?: string; context?: 'personal' | 'partner' }): Promise<ApiResponse<{ updated: boolean }>> => {
    return fetchApi<{ updated: boolean }>(`${BASE_URL}?action=update_user`, {
      method: 'POST',
      body: JSON.stringify({ id: userId, ...updates }),
    });
  },

  // Upload media file
  uploadMedia: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_URL}?action=upload_media`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header - browser will set it with boundary for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      const isSuccess = rawData.status === "success";

      if (isSuccess) {
        return {
          success: true,
          data: { url: toAbsoluteUrl(rawData.url) },
        };
      }

      return {
        success: false,
        error: rawData.message || "Upload failed",
      };
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },
};

export type { ApiResponse, LoginCredentials, RegisterData, UserData, DropData, QuestData, CampaignData, CampaignMetrics };

