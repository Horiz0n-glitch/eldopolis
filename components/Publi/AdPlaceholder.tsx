"use client"

import React from "react"

interface AdPlaceholderProps {
    width?: string | number
    height?: string | number
    className?: string
    text?: string
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
    width = "100%",
    height = "250px",
    className = "",
    text = "Espacio Publicitario"
}) => {
    return (
        <div
            className={`relative flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden group transition-all duration-300 hover:border-primary/30 ${className}`}
            style={{ width, height }}
        >
            <div className="text-center p-6">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl mb-2 group-hover:text-primary transition-colors">
                    ads_click
                </span>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {text}
                </p>
            </div>
        </div>
    )
}

export default AdPlaceholder
