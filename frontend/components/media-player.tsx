"use client"

import { useRef, useEffect, useState } from "react"
import { CheckCircle, Download, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaPlayerProps {
  mediaUrl: string
  mediaType?: "video" | "audio"
  onDownload?: () => void
  fileName?: string
}

export default function MediaPlayer({ mediaUrl, mediaType = "video", onDownload, fileName }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [canPlay, setCanPlay] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [videoInfo, setVideoInfo] = useState<{
    duration?: number
    videoWidth?: number
    videoHeight?: number
  }>({})

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Clear any previous error states
    setHasError(false)
    setErrorDetails("")
    setIsLoading(true)

    const handleCanPlay = () => {
      // Video can play event
      setCanPlay(true)
      setIsLoading(false)
      setHasError(false)
      setErrorDetails("")
    }

    const handleLoadedMetadata = () => {
      // Video metadata loaded
      if (video) {
        setVideoInfo({
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        })
      }
    }

    const handleError = (e: Event) => {
      console.error("Video playback error:", e)
      const target = e.target as HTMLVideoElement
      let errorMessage = "Unknown error"

      if (target && target.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Video playback was aborted"
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading video"
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Video format not supported or corrupted"
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video format or codec not supported"
            break
          default:
            errorMessage = `Media error code: ${target.error.code}`
        }
      }

      // Only show error if it's not a Next.js development error
      if (!errorMessage.includes("intercept-console-error")) {
        setErrorDetails(errorMessage)
        setHasError(true)
      }
      setIsLoading(false)
    }

    const handleLoadStart = () => {
      // Video load started
      setIsLoading(true)
      setHasError(false)
      setErrorDetails("")
    }

    const handleProgress = () => {
      // Video loading progress
    }

    const handleLoadedData = () => {
      // Video data loaded
      setIsLoading(false)
    }

    // Add all event listeners
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("error", handleError)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("loadeddata", handleLoadedData)

    // Set the video source and load
    // Setting video source
    video.src = mediaUrl

    // Add a small delay to ensure the blob URL is ready
    setTimeout(() => {
      video.load()
    }, 100)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("loadeddata", handleLoadedData)
    }
  }, [mediaUrl])

  const handleRetry = () => {
    const video = videoRef.current
    if (video) {
      setHasError(false)
      setIsLoading(true)
      setErrorDetails("")
      video.load()
    }
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-900 relative">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          preload="metadata"
          crossOrigin="anonymous"
          style={{ display: hasError ? "none" : "block" }}
          onError={(e) => {
            // Suppress Next.js development errors
            e.preventDefault()
            // Video element error event
          }}
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-6 max-w-md">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Video Playback Error</h3>
              <p className="text-sm text-gray-300 mb-2">{errorDetails}</p>
              <p className="text-xs text-gray-400 mb-4">The video file may be corrupted or in an unsupported format.</p>

              <div className="space-y-3">
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>

                {onDownload && (
                  <Button onClick={onDownload} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Video File
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Processed video with sign language interpretation (MP4 format)
          {fileName && <span className="block text-xs text-gray-500 mt-1">File: {fileName}</span>}
        </p>

        {/* Video information - only show duration if available */}
        {videoInfo.duration && (
          <div className="mt-2 text-xs text-gray-500">
            <p>Duration: {Math.round(videoInfo.duration)}s</p>
          </div>
        )}

        {canPlay}

        {hasError && (
          <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
            <div className="text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Troubleshooting Tips:</p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• Check if your Flask API is returning a valid MP4 file</li>
                <li>• Verify the video codec is H.264 (widely supported)</li>
                <li>• Ensure the file isn't corrupted during processing</li>
                <li>• Try downloading and playing the file locally</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
