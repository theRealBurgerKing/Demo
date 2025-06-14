import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface AIVisualizerProps {
  onClose: () => void
  onShowResult: (resultImage: string, originalImage: string) => void
}

const API_BASE = 'https://d12qavyo5a8mvc.cloudfront.net'

const AIVisualizer = ({ onClose, onShowResult }: AIVisualizerProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [showTaskIdModal, setShowTaskIdModal] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const [modalMessage, setModalMessage] = useState<string | null>(null)

  // Mock process: simulate upload, progress, and result
  const mockProcess = (file: File) => {
    setIsLoading(true)
    setProgress(0)
    setResultImage(null)
    const origUrl = URL.createObjectURL(file)
    setOriginalImageUrl(origUrl)
    let prog = 0
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 15) + 10
      if (prog >= 100) {
        prog = 100
        setProgress(prog)
        clearInterval(interval)
        setTimeout(() => {
          setIsLoading(false)
          setResultImage('public/generatedpic.jpg')
          // Call onShowResult to open result drawer
          onShowResult('public/generatedpic.jpg', origUrl)
        }, 500)
      } else {
        setProgress(prog)
      }
    }, 500)
  }

  // Helper: upload file to /upload, then start task
  const uploadAndStartTask = async (file: File) => {
    setIsLoading(true)
    setTaskId(null)
    setError(null)
    setModalMessage(null)
    try {
      // 1. Upload image
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: uploadForm,
      })
      if (!uploadRes.ok) throw new Error('Failed to upload image')
      const uploadData = await uploadRes.json()
      if (!uploadData.path) throw new Error('No image path returned')
      // 2. Start work task
      const body = {
        base_image: uploadData.path,
        selected_reference: '/static/ref/a1.jpeg',
        texture_paths: ['/static/textures/axon_cladding.jpg'],
        recommended_colours: [
          { name: 'Dulux Whisper White', rgb: '244,242,236' },
          { name: 'Knotwood Silver Wattle', rgb: '200,198,192' }
        ],
        selected_product: {
          name: 'Linea™ Weatherboard',
          texture: 'textures/linea_weatherboard.png'
        },
        remove_obstacles: true,
        use_mask: false,
        design_ideology: 'Minimalistic',
        style_config: 'Modern Coastal'
      }
      const res = await fetch(`${API_BASE}/api/start_work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 400) {
        const errData = await res.json()
        setModalMessage(errData.Message || 'Bad Request')
        setShowTaskIdModal(true)
        return
      }
      if (!res.ok) throw new Error('Failed to start task')
      const data = await res.json()
      if (!data.task_id) throw new Error('No task_id returned')
      setTaskId(data.task_id)
      setModalMessage(null)
      setShowTaskIdModal(true)
    } catch (err: any) {
      setModalMessage(err.message || 'Failed to start task')
      setShowTaskIdModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper: poll for result
  const pollResult = async (task_id: string) => {
    let elapsed = 0
    const interval = 3000
    const maxTime = 90000
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/taskresult/${task_id}`)
        if (!res.ok) throw new Error('Failed to get result')
        const data = await res.json()
        if (data.status === 'finished') {
          setResultImage(data.result_image_path)
          setIsLoading(false)
          setProgress(100)
          return
        }
        if (data.status === 'failed') {
          setError('Task failed')
          setIsLoading(false)
          return
        }
        // Still processing
        elapsed += interval
        setProgress(Math.min(99, Math.floor((elapsed / maxTime) * 100)))
        if (elapsed < maxTime) {
          pollingRef.current = setTimeout(poll, interval)
        } else {
          setError('Timeout: No result after 90 seconds')
          setIsLoading(false)
        }
      } catch (err: any) {
        setError(err.message || 'Polling error')
        setIsLoading(false)
      }
    }
    poll()
  }

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Only JPG and PNG formats are supported')
      return false
    }

    if (file.size > maxSize) {
      setError('File size cannot exceed 5MB')
      return false
    }

    setError(null)
    return true
  }

  // When file selected, start mock process
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      mockProcess(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Simple before/after slider
  const [sliderValue, setSliderValue] = useState(50)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-x-0 bottom-0 h-screen bg-white z-50 overflow-auto"
      >
        {/* Header */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8 mt-2">See products in your room</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
            {/* Upload Area */}
            <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center min-w-[320px] max-w-lg">
              <div
                className={`w-full flex flex-col items-center justify-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : ''
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="w-full flex flex-col items-center cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-3 mb-2">
                      <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                    </div>
                    <span className="font-semibold text-lg">Start from a Photo</span>
                    <span className="text-gray-500 text-sm">Drag and drop your image anywhere on this page</span>
                  </div>
                  <div className="my-4 w-full flex items-center">
                    <div className="flex-grow border-t border-dashed border-gray-300"></div>
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-dashed border-gray-300"></div>
                  </div>
                  {/* Sample Images */}
                  <div className="flex gap-2 justify-center w-full mb-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-14 h-14 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                        <span className="text-xs text-gray-400">Sample</span>
                      </div>
                    ))}
                  </div>
                  {/* Progress & Result */}
                  {isLoading && (
                    <div className="w-full mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Processing... ({progress}%)</p>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="mt-2 text-center">
                      <p className="text-gray-800 font-medium">
                        Selected file: {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </label>
              </div>
            </div>
            {/* QR Code Area */}
            <div className="flex-1 min-w-[260px] max-w-xs bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-8 border border-gray-100">
              <span className="text-gray-500 text-sm mb-4 text-center">Please scan this QR code with your phone to easily upload the image of the room.</span>
              <div className="bg-white rounded-lg p-4 shadow flex items-center justify-center">
                {/* Placeholder for QR code */}
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-400">QR</span>
                </div>
              </div>
            </div>
          </div>
          {/* Design History Link */}
          <div className="mt-12 text-left">
            <a href="#" className="text-gray-600 text-sm hover:underline">Design History</a>
          </div>
        </div>
      </motion.div>
      {/* Task ID Modal */}
      {showTaskIdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            {taskId && !modalMessage && <>
              <h3 className="text-lg font-semibold mb-4">Task Started</h3>
              <p className="mb-2 text-gray-700 break-all">Task ID:</p>
              <p className="mb-4 text-blue-600 font-mono text-sm break-all">{taskId}</p>
            </>}
            {modalMessage && <>
              <h3 className="text-lg font-semibold mb-4 text-red-600">Error</h3>
              <p className="mb-4 text-gray-700 break-all">{modalMessage}</p>
            </>}
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => { setShowTaskIdModal(false); setTaskId(null); setModalMessage(null); }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AIVisualizer 