"use client"

import React from "react"

const LeftFloatingAd: React.FC = () => {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
      <div className="w-32 h-96 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-center p-2">
        <span className="text-[10px] text-gray-400 font-bold uppercase rotate-90">Espacio Publicitario</span>
      </div>
    </div>
  )
}

export default LeftFloatingAd
