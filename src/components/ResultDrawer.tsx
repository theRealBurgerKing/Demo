import * as React from 'react'
import { motion } from 'framer-motion'

interface ResultDrawerProps {
  open: boolean
  onClose: () => void
  resultImage: string
  originalImage?: string
}

const ResultDrawer: React.FC<ResultDrawerProps> = ({ open, onClose, resultImage, originalImage }: ResultDrawerProps) => {
  const [slider, setSlider] = React.useState(50) // percent
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  // Mouse/touch event handlers
  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true)
    document.body.style.userSelect = 'none'
  }
  React.useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      let clientX = 0
      if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX
      }
      const rect = containerRef.current.getBoundingClientRect()
      let percent = ((clientX - rect.left) / rect.width) * 100
      percent = Math.max(0, Math.min(100, percent))
      setSlider(percent)
    }
    const onEnd = () => {
      setDragging(false)
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [dragging])

  if (!open) return null
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-white overflow-auto"
    >
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-2xl font-semibold mb-6">Your Generated Design</h2>
        <div className="w-full max-w-3xl flex flex-col items-center">
          {originalImage ? (
            <div
              ref={containerRef}
              className="relative w-full max-w-2xl aspect-[4/3] bg-gray-100 overflow-hidden rounded-lg shadow"
              style={{ touchAction: 'none', cursor: dragging ? 'ew-resize' : 'default' }}
            >
              {/* Result image (background, full) */}
              <img
                src={resultImage}
                alt="Result"
                className="absolute top-0 left-0 w-full h-full object-cover"
                draggable={false}
              />
              {/* Original image (top, left side only) */}
              <img
                src={originalImage}
                alt="Original"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - slider}% 0 0)`, transition: dragging ? 'none' : 'clip-path 0.2s' }}
                draggable={false}
              />
              {/* Slider bar */}
              <div
                className="absolute top-0 bottom-0"
                style={{ left: `calc(${slider}% - 18px)` }}
              >
                <div
                  className="relative h-full flex items-center justify-center"
                  style={{ width: '36px' }}
                >
                  <div
                    className="w-1 h-full bg-white/80 shadow border border-gray-300 rounded"
                    style={{ marginLeft: '17px', marginRight: '17px' }}
                  />
                  <button
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow flex items-center justify-center w-9 h-9 cursor-ew-resize z-10"
                    style={{ outline: 'none' }}
                    onMouseDown={onStart}
                    onTouchStart={onStart}
                    tabIndex={0}
                    aria-label="Compare slider"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="9 6 15 12 9 18" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <img src={resultImage} alt="Generated Result" className="rounded-lg shadow max-h-[70vh] object-contain" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ResultDrawer 