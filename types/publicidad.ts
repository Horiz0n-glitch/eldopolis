export interface Publicidad {
  id: string
  title: string
  description?: string
  imageUrl: string
  linkUrl: string
  position: "header" | "sidebar" | "footer" | "inline" | "popup"
  isActive: boolean
  startDate: string
  endDate: string
  priority: number
  clicks: number
  impressions: number
  targetAudience: string[]
  budget: number
  costPerClick: number
  createdAt: string
  updatedAt: string
  campaignId?: string
  advertiser?: {
    name: string
    email: string
    company: string
  }
  targeting?: {
    categories: string[]
    tags: string[]
    demographics: {
      ageRange: [number, number]
      gender: "all" | "male" | "female"
      location: string[]
    }
    devices: ("desktop" | "mobile" | "tablet")[]
    timeSlots: {
      days: number[]
      hours: [number, number]
    }
  }
  performance?: {
    ctr: number // Click-through rate
    cpm: number // Cost per mille
    conversions: number
    revenue: number
  }
  creativeSpecs?: {
    width: number
    height: number
    format: "image" | "video" | "html"
    fileSize: number
    duration?: number // For video ads
  }
  status: "draft" | "pending" | "approved" | "rejected" | "paused" | "completed"
  reviewNotes?: string
  scheduledStart?: string
  scheduledEnd?: string
}

export interface PublicidadStats {
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  totalRevenue: number
  averageCTR: number
  topPerformingAds: Publicidad[]
  recentAds: Publicidad[]
}

export interface PublicidadFilters {
  position?: string
  isActive?: boolean
  status?: string
  advertiser?: string
  dateFrom?: string
  dateTo?: string
  minBudget?: number
  maxBudget?: number
  sortBy?: "priority" | "clicks" | "impressions" | "ctr" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface PublicidadResponse {
  ads: Publicidad[]
  total: number
  filters: PublicidadFilters
  stats: PublicidadStats
}

export interface AdPlacement {
  position: string
  maxAds: number
  currentAds: Publicidad[]
  dimensions: {
    width: number
    height: number
  }
  allowedFormats: string[]
  pricing: {
    baseCPM: number
    premiumMultiplier: number
  }
}

export interface AdCampaign {
  id: string
  name: string
  description: string
  advertiser: string
  budget: number
  spent: number
  startDate: string
  endDate: string
  status: "active" | "paused" | "completed" | "cancelled"
  ads: Publicidad[]
  targeting: {
    categories: string[]
    demographics: any
    locations: string[]
  }
  performance: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpm: number
    roi: number
  }
}
