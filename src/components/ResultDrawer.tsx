import * as React from 'react'
import { motion } from 'framer-motion'

interface ResultDrawerProps {
  open: boolean
  onClose: () => void
  resultImage: string
  originalImage?: string
}

const ResultDrawer: React.FC<ResultDrawerProps> = ({ open, onClose, resultImage, originalImage }) => {
  const [slider, setSlider] = React.useState(50) // percent
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  // Mouse/touch event handlers
  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
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

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-white overflow-auto"
    >
      {/* Header */}
      <div className="flex justify-end items-center p-4 border-b">
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-5xl">
          {originalImage ? (
            <div
              ref={containerRef}
              className="relative w-full bg-gray-100 overflow-hidden rounded-lg shadow-lg mx-auto"
              style={{
                touchAction: 'none',
                cursor: dragging ? 'ew-resize' : 'default',
                aspectRatio: '16/10',
                maxHeight: '70vh'
              }}
            >
              {/* Original image layer - displayed on the left */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - slider}% 0 0)`
                }}
              >
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: 'center',
                  }}
                  draggable={false}
                />
              </div>
              
              {/* Result image layer - displayed on the right */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 0 0 ${slider}%)`
                }}
              >
                <img
                  src={resultImage}
                  alt="AI Generated Result"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: 'center',
                  }}
                  draggable={false}
                />
              </div>

              {/* Divider line and control button */}
              <div
                className="absolute top-0 bottom-0 flex items-center justify-center"
                style={{
                  left: `${slider}%`,
                  transform: 'translateX(-50%)',
                  width: '4px'
                }}
              >
                {/* Divider line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" />
                
                {/* Drag control button */}
                <button
                  className="relative bg-white border-2 border-gray-300 rounded-full shadow-lg flex items-center justify-center w-12 h-12 cursor-ew-resize hover:border-blue-400 transition-colors z-10 group"
                  onMouseDown={onStart}
                  onTouchStart={onStart}
                  tabIndex={0}
                  aria-label={`Compare slider at ${Math.round(slider)}%`}
                >
                  {/* Left arrow */}
                  <svg
                    className="w-3 h-3 text-gray-500 group-hover:text-blue-500 -ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="15 18 9 12 15 6" strokeWidth="2" />
                  </svg>
                  {/* Right arrow */}
                  <svg
                    className="w-3 h-3 text-gray-500 group-hover:text-blue-500 -mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="9 6 15 12 9 18" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              {/* Image labels */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                After
              </div>
            </div>
          ) : (
            /* If no original image, display only result image */
            <div className="w-full flex justify-center">
              <img
                src={resultImage}
                alt="AI Generated Result"
                className="rounded-lg shadow-lg max-h-[70vh] object-contain mx-auto"
              />
            </div>
          )}

          {/* Thumbnail row */}
          {originalImage && (
            <div className="flex justify-center mt-8 space-x-2">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                    index === 1 ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={resultImage}
                    alt={`Variation ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom action buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
             <a
               href={resultImage}
               download="ai-generated-result.jpg"
               className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
               <span>Download</span>
             </a>
             
             <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
               </svg>
               <span>Share</span>
             </button>
           </div>
         </div>
       </div>
    </motion.div>
  )
}

export default ResultDrawer