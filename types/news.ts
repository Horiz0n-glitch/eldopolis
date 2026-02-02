export interface News {
  id: string
  title: string
  subtitle?: string
  description: string
  mainCategory: string
  subCategory?: string
  tags?: string[]
  author?: string
  date: string
  timestamp: string | number
  image?: string | string[]
  imageUrl?: string
  imageCaption?: string
  featured?: boolean
  breaking?: boolean
  views?: number
  likes?: number
  comments?: number
  status?: "draft" | "published" | "archived"
  slug?: string
  excerpt?: string
  readTime?: number
  source?: string
  location?: string
  priority?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  socialImage?: string
  publishedAt?: string
  updatedAt?: string
  createdAt?: string
  video?: string
  audio?: string
  youtubeLink?: string
  featuredType?: string
  content?: string
  summary?: string
}

export interface NewsCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  order?: number
  isActive?: boolean
  newsCount?: number
}

export interface NewsTag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  newsCount?: number
  isActive?: boolean
}

export interface NewsAuthor {
  id: string
  name: string
  slug: string
  bio?: string
  avatar?: string
  email?: string
  social?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  isActive?: boolean
  articlesCount?: number
}

export interface NewsComment {
  id: string
  newsId: string
  author: string
  email?: string
  content: string
  parentId?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt?: string
  likes?: number
  replies?: NewsComment[]
}

export interface NewsStats {
  totalNews: number
  publishedNews: number
  draftNews: number
  totalViews: number
  totalLikes: number
  totalComments: number
  categoriesCount: number
  tagsCount: number
  authorsCount: number
}

export interface NewsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface NewsFilters {
  category?: string
  tag?: string
  author?: string
  status?: "draft" | "published" | "archived"
  featured?: boolean
  breaking?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: "date" | "views" | "likes" | "title"
  sortOrder?: "asc" | "desc"
}

export interface NewsResponse {
  news: News[]
  pagination: NewsPagination
  filters: NewsFilters
  categories: NewsCategory[]
  tags: NewsTag[]
  authors: NewsAuthor[]
}

export interface NewsDetail extends News {
  relatedNews?: News[]
  previousNews?: Pick<News, "id" | "title" | "slug">
  nextNews?: Pick<News, "id" | "title" | "slug">
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

export interface NewsSearchResult {
  news: News[]
  total: number
  query: string
  suggestions?: string[]
  filters: NewsFilters
  facets?: {
    categories: Array<{ name: string; count: number }>
    tags: Array<{ name: string; count: number }>
    authors: Array<{ name: string; count: number }>
    dates: Array<{ period: string; count: number }>
  }
}

export interface NewsMetadata {
  title: string
  description: string
  keywords: string[]
  image?: string
  canonical?: string
  robots?: string
  openGraph?: {
    title: string
    description: string
    image: string
    type: string
    url: string
  }
  twitter?: {
    card: string
    title: string
    description: string
    image: string
  }
  structuredData?: any
}

export interface NewsConfig {
  siteName: string
  siteUrl: string
  defaultImage: string
  itemsPerPage: number
  maxRelatedNews: number
  enableComments: boolean
  enableSocialSharing: boolean
  enableNewsletterSignup: boolean
  enablePushNotifications: boolean
  cacheTimeout: number
  imageOptimization: {
    quality: number
    formats: string[]
    sizes: number[]
  }
  seo: {
    titleTemplate: string
    defaultDescription: string
    keywords: string[]
    twitterHandle: string
    facebookAppId?: string
  }
}
