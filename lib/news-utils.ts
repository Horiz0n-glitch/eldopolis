import type { News } from "./validations"

export const sortNews = (a: News, b: News): number => {
    const featuredOrder: Record<string, number> = {
        cover: 1,
        featured1: 2,
        featured2: 3,
        featured3: 4,
    }

    const aPriority = a.featuredType ? featuredOrder[a.featuredType] || 99 : 99
    const bPriority = b.featuredType ? featuredOrder[b.featuredType] || 99 : 99

    // Sort by priority first, then by date descending
    return aPriority - bPriority || new Date(b.date).getTime() - new Date(a.date).getTime()
}
