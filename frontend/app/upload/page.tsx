"use client"

import React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, CheckCircle, AlertCircle, Loader2, Download, ArrowLeft, Info } from 'lucide-react'
import MediaPlayer from "@/components/media-player"
import Link from "next/link"

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [processedVideoBlob, setProcessedVideoBlob] = useState<Blob | null>(null)
  const [processedFileName, setProcessedFileName] = useState<string>("")
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
          setUploadedFile(file)
          setUploadStatus("idle")
          setProcessedVideoUrl(null)
          setProcessedVideoBlob(null)
          setProcessedFileName("")
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload a video or audio file.",
            variant: "destructive",
          })
        }
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
      "audio/*": [".mp3", ".wav", ".aac", ".ogg", ".flac"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!uploadedFile) return

    try {
      setUploadStatus("uploading")
      setUploadProgress(0)

      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("fileType", uploadedFile.type.startsWith("video/") ? "video" : "audio")

      // Slower upload progress simulation to better reflect processing time
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 30) {
            clearInterval(progressInterval)
            return 30
          }
          return prev + 2 // Slower increment (was 10, now 2)
        })
      }, 800) // Slower interval (was 500ms, now 800ms)

      // Send to Flask API
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Failed to process file: ${response.status} ${response.statusText}`)
      }

      // Update progress to show upload complete, processing starting
      setUploadProgress(40)
      setUploadStatus("processing")

      // Simulate processing progress more realistically
      const processingInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(processingInterval)
            return 95
          }
          return prev + 1 // Very slow increment during processing
        })
      }, 1500) // Slow interval for processing (1.5 seconds per increment)

      // Check content type
      const contentType = response.headers.get("content-type")
      // Check response content type

      // Get the video file as a blob from the response
      const videoBlob = await response.blob()
      // Process received video blob

      clearInterval(processingInterval)

      // Verify blob is not empty
      if (videoBlob.size === 0) {
        throw new Error("Received empty file from server")
      }

      // Ensure the blob has the correct MIME type
      const correctedBlob = new Blob([videoBlob], { type: "video/mp4" })

      // Create a URL for the blob to display in the video player
      const videoUrl = URL.createObjectURL(correctedBlob)
      // Created blob URL for video playback

      // Generate filename - now using MP4 extension
      const originalName = uploadedFile.name.split(".")[0]
      const fileName = `sign-opsis-${originalName}.mp4`

      setProcessedVideoBlob(correctedBlob)
      setProcessedVideoUrl(videoUrl)
      setProcessedFileName(fileName)
      setUploadProgress(100)
      setUploadStatus("success")

      toast({
        title: "File processed successfully",
        description: `Your ${uploadedFile.type.startsWith("video/") ? "video" : "audio"} has been processed with sign language interpretation.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "There was an error processing your file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!processedVideoBlob || !processedFileName) return

    // Create download link
    const downloadUrl = URL.createObjectURL(processedVideoBlob)
    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = processedFileName

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up the temporary URL
    URL.revokeObjectURL(downloadUrl)

    toast({
      title: "Download started",
      description: "Your processed video is being downloaded.",
    })
  }

  const resetUpload = () => {
    // Clean up any existing blob URLs to prevent memory leaks
    if (processedVideoUrl) {
      URL.revokeObjectURL(processedVideoUrl)
    }

    setUploadedFile(null)
    setUploadProgress(0)
    setUploadStatus("idle")
    setProcessedVideoUrl(null)
    setProcessedVideoBlob(null)
    setProcessedFileName("")
  }

  // Clean up blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl)
      }
    }
  }, [processedVideoUrl])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 transition-colors mr-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-purple-700">Sign-opsis</h1>
              <span className="ml-2 text-sm text-gray-500">Upload</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Upload Your Media to Sign-opsis</h1>
            <p className="text-gray-600">Upload a video or audio file to add sign language interpretation</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                {!processedVideoUrl && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? "Drop the file here"
                        : "Drag and drop a video or audio file here, or click to select"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports video (MP4, MOV, AVI, MKV) and audio (MP3, WAV, AAC) formats
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Processed files will be returned in MP4 format</p>
                  </div>
                )}

                {uploadedFile && !processedVideoUrl && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB •
                          {uploadedFile.type.startsWith("video/") ? " Video" : " Audio"} file
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetUpload}
                        disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                      >
                        Remove
                      </Button>
                    </div>

                    {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            {uploadStatus === "uploading"
                              ? "Uploading to Sign-opsis..."
                              : "Processing with sign language interpretation..."}
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                        {uploadStatus === "processing" && (
                          <p className="text-xs text-gray-500 mt-2">
                            AI processing in progress - this may take several minutes depending on file length and complexity
                          </p>
                        )}
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="mt-4 flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>Error processing file. Please try again.</span>
                      </div>
                    )}

                    {uploadStatus === "idle" && (
                      <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" onClick={handleUpload}>
                        Upload and Process with Sign-opsis
                      </Button>
                    )}

                    {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                      <Button className="w-full mt-4" disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadStatus === "uploading" ? "Uploading..." : "Processing with AI..."}
                      </Button>
                    )}
                  </div>
                )}

                {processedVideoUrl && (
                  <div className="mt-6">
                    <div className="flex items-center mb-4 text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        Sign-opsis has successfully processed your file with sign language interpretation!
                      </span>
                    </div>

                    <MediaPlayer
                      mediaUrl={processedVideoUrl}
                      mediaType="video"
                      onDownload={handleDownload}
                      fileName={processedFileName}
                    />

                    <div className="flex gap-4 mt-6">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download MP4 File
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={resetUpload}>
                        Process Another File
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!processedVideoUrl && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">How Sign-opsis Works</h2>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700">
                    <li>Upload your video or audio file using the form above</li>
                    <li>Sign-opsis AI system processes your file and generates sign language interpretation</li>
                    <li>The processed file is returned as an MP4 video with embedded sign language</li>
                    <li>Preview the result directly in your browser and download your accessible media file</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
