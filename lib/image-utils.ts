export function convertirURL(urlOriginal: string): string {
    if (!urlOriginal) return "/placeholder.svg?height=400&width=800"

    const newBaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL || "https://pub-514df041e2b3494caab09827cb896071.r2.dev"
    const imagePathIndex = urlOriginal.indexOf("/image")

    if (imagePathIndex !== -1) {
        return newBaseUrl + urlOriginal.slice(imagePathIndex)
    }

    return urlOriginal
}

export const processImageURL = (url: string | string[]): string | string[] => {
    if (Array.isArray(url)) {
        return url.map(convertirURL)
    }
    return convertirURL(url)
}
