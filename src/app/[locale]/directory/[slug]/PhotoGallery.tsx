"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  images: string[]
  businessName: string
}

export default function PhotoGallery({ images, businessName }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }
  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length))
  }

  // Show up to 5 in the strip; first image is large
  const preview = images.slice(0, 5)

  return (
    <>
      {/* Photo strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`grid gap-2 ${preview.length === 1 ? "grid-cols-1" : "grid-cols-[2fr_1fr]"}`}>
          {/* Hero image */}
          <div
            className="relative rounded-xl overflow-hidden cursor-pointer aspect-[16/9] sm:aspect-[21/9] bg-gray-800"
            onClick={() => setLightbox(0)}
          >
            <img
              src={preview[0]}
              alt={`${businessName} photo 1`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Side grid */}
          {preview.length > 1 && (
            <div className={`grid gap-2 ${preview.length > 3 ? "grid-rows-2" : "grid-rows-1"}`}>
              {preview.slice(1, 5).map((url, idx) => (
                <div
                  key={url}
                  className="relative rounded-xl overflow-hidden cursor-pointer bg-gray-800"
                  onClick={() => setLightbox(idx + 1)}
                >
                  <img
                    src={url}
                    alt={`${businessName} photo ${idx + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* "View all" overlay on last visible */}
                  {idx === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">+{images.length - 5} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {images.length > 5 && (
          <button
            onClick={() => setLightbox(0)}
            className="mt-2 text-xs text-gray-300 hover:text-white underline"
          >
            View all {images.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightbox + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev() }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightbox]}
            alt={`${businessName} photo ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next() }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto px-2">
              {images.map((url, i) => (
                <button
                  key={url}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                    i === lightbox ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
