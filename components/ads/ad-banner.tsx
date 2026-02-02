interface AdBannerProps {
  size: "small" | "medium" | "large"
  className?: string
}

export default function AdBanner({ size, className = "" }: AdBannerProps) {
  const adSizes = {
    small: { width: 320, height: 100 },
    medium: { width: 728, height: 250 },
    large: { width: 970, height: 300 },
  }

  const { width, height } = adSizes[size]

  return (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <div className="text-sm font-medium">Publicidad {size}</div>
        <div className="text-xs">
          {width} x {height}
        </div>
      </div>
    </div>
  )
}
