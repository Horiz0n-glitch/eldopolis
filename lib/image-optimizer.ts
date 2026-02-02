interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "auto"
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  position?: "center" | "top" | "bottom" | "left" | "right"
  blur?: number
  sharpen?: boolean
  grayscale?: boolean
}

interface OptimizedImageResult {
  src: string
  srcSet: string
  sizes: string
  placeholder: string
  format: string
}

class ImageOptimizer {
  private static instance: ImageOptimizer
  private cache = new Map<string, OptimizedImageResult>()
  private readonly CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL || "https://pub-514df041e2b3494caab09827cb896071.r2.dev"

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  // Detectar soporte de formatos modernos
  private detectFormatSupport(): { webp: boolean; avif: boolean } {
    if (typeof window === "undefined") {
      return { webp: true, avif: true } // Asumir soporte en SSR
    }

    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1

    const webp = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0

    // AVIF detection es más complejo, usar feature detection
    const avif = "createImageBitmap" in window && CSS.supports("image-rendering", "pixelated")

    return { webp, avif }
  }

  // Generar placeholder blur
  generatePlaceholder(width = 10, height = 10): string {
    if (typeof window === "undefined") {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
        </svg>
      `)}`
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Crear gradiente sutil
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#f9fafb")
      gradient.addColorStop(1, "#f3f4f6")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    return canvas.toDataURL("image/jpeg", 0.1)
  }

  // Optimizar URL de imagen
  optimizeImageUrl(originalUrl: string, options: ImageOptimizationOptions = {}): string {
    const {
      width,
      height,
      quality = 75,
      format = "auto",
      fit = "cover",
      position = "center",
      blur,
      sharpen,
      grayscale,
    } = options

    // Si es una URL de Cloudinary, usar sus transformaciones
    if (originalUrl.includes("cloudinary.com")) {
      return this.optimizeCloudinaryUrl(originalUrl, options)
    }

    // Si es nuestra CDN R2, usar parámetros de query
    if (originalUrl.includes(this.CDN_BASE_URL)) {
      return this.optimizeR2Url(originalUrl, options)
    }

    // Para otras URLs, usar Next.js Image Optimization
    const params = new URLSearchParams()

    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    if (quality !== 75) params.set("q", quality.toString())
    if (format !== "auto") params.set("f", format)

    return `/_next/image?url=${encodeURIComponent(originalUrl)}&${params.toString()}`
  }

  private optimizeCloudinaryUrl(url: string, options: ImageOptimizationOptions): string {
    const { width, height, quality, format, fit, blur, sharpen, grayscale } = options

    const baseUrl = url.split("/upload/")[0] + "/upload/"
    const imagePath = url.split("/upload/")[1]
    const transformations = []

    // Formato automático basado en soporte del navegador
    if (format === "auto") {
      const support = this.detectFormatSupport()
      if (support.avif) {
        transformations.push("f_avif")
      } else if (support.webp) {
        transformations.push("f_webp")
      } else {
        transformations.push("f_auto")
      }
    } else if (format) {
      transformations.push(`f_${format}`)
    }

    // Dimensiones
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)

    // Calidad
    if (quality) transformations.push(`q_${quality}`)

    // Modo de ajuste
    transformations.push(`c_${fit}`)

    // Efectos
    if (blur) transformations.push(`e_blur:${blur}`)
    if (sharpen) transformations.push("e_sharpen")
    if (grayscale) transformations.push("e_grayscale")

    // Optimizaciones automáticas
    transformations.push("fl_progressive") // JPEG progresivo
    transformations.push("fl_immutable_cache") // Cache inmutable

    return `${baseUrl}${transformations.join(",")}/${imagePath}`
  }

  private optimizeR2Url(url: string, options: ImageOptimizationOptions): string {
    const { width, height, quality, format } = options
    const urlObj = new URL(url)

    if (width) urlObj.searchParams.set("width", width.toString())
    if (height) urlObj.searchParams.set("height", height.toString())
    if (quality) urlObj.searchParams.set("quality", quality.toString())
    if (format && format !== "auto") urlObj.searchParams.set("format", format)

    return urlObj.toString()
  }

  // Generar srcSet responsivo
  generateSrcSet(
    originalUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920],
    options: Omit<ImageOptimizationOptions, "width"> = {},
  ): string {
    return breakpoints
      .map((width) => {
        const optimizedUrl = this.optimizeImageUrl(originalUrl, { ...options, width })
        return `${optimizedUrl} ${width}w`
      })
      .join(", ")
  }

  // Generar sizes attribute
  generateSizes(breakpoints: Array<{ breakpoint: string; size: string }>): string {
    return breakpoints.map(({ breakpoint, size }) => `${breakpoint} ${size}`).join(", ")
  }

  // Optimización completa de imagen
  optimizeImage(
    originalUrl: string,
    options: ImageOptimizationOptions & {
      breakpoints?: number[]
      responsiveSizes?: Array<{ breakpoint: string; size: string }>
    } = {},
  ): OptimizedImageResult {
    const cacheKey = `${originalUrl}-${JSON.stringify(options)}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const {
      breakpoints = [320, 640, 768, 1024, 1280, 1920],
      responsiveSizes = [
        { breakpoint: "(max-width: 320px)", size: "280px" },
        { breakpoint: "(max-width: 640px)", size: "600px" },
        { breakpoint: "(max-width: 768px)", size: "728px" },
        { breakpoint: "(max-width: 1024px)", size: "984px" },
        { breakpoint: "(max-width: 1280px)", size: "1240px" },
        { breakpoint: "", size: "100vw" },
      ],
      ...imageOptions
    } = options

    const src = this.optimizeImageUrl(originalUrl, imageOptions)
    const srcSet = this.generateSrcSet(originalUrl, breakpoints, imageOptions)
    const sizes = this.generateSizes(responsiveSizes)
    const placeholder = this.generatePlaceholder(10, 10)

    // Detectar formato final
    const support = this.detectFormatSupport()
    let finalFormat = "jpeg"

    if (imageOptions.format === "auto") {
      if (support.avif) finalFormat = "avif"
      else if (support.webp) finalFormat = "webp"
    } else if (imageOptions.format) {
      finalFormat = imageOptions.format
    }

    const result: OptimizedImageResult = {
      src,
      srcSet,
      sizes,
      placeholder,
      format: finalFormat,
    }

    this.cache.set(cacheKey, result)
    return result
  }

  // Precargar imagen crítica
  preloadImage(url: string, options: ImageOptimizationOptions = {}): void {
    if (typeof window === "undefined") return

    const optimizedUrl = this.optimizeImageUrl(url, options)

    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = optimizedUrl

    // Agregar srcset si es necesario
    if (options.width) {
      const srcSet = this.generateSrcSet(url, [options.width], options)
      link.setAttribute("imagesrcset", srcSet)
    }

    document.head.appendChild(link)
  }

  // Limpiar cache
  clearCache(): void {
    this.cache.clear()
  }

  // Estadísticas de cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const imageOptimizer = ImageOptimizer.getInstance()

// Utilidades de conveniencia
export const optimizeImageUrl = (url: string, options?: ImageOptimizationOptions) =>
  imageOptimizer.optimizeImageUrl(url, options)

export const optimizeImage = (url: string, options?: ImageOptimizationOptions) =>
  imageOptimizer.optimizeImage(url, options)

export const preloadImage = (url: string, options?: ImageOptimizationOptions) =>
  imageOptimizer.preloadImage(url, options)
