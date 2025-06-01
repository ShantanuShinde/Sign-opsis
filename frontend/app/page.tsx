import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Upload, Video, Globe, Play, Users, Accessibility } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-700">Sign-opsis</h1>
              <span className="ml-2 text-sm text-gray-500">Making Media Accessible</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                How It Works
              </Link>
              <Link href="/upload" className="text-gray-600 hover:text-purple-600 transition-colors">
                Upload
              </Link>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/upload">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Sign-opsis</h1>
                <p className="text-xl md:text-2xl font-medium opacity-90">
                  Making Media Accessible through Sign Language
                </p>
              </div>
              <p className="text-lg md:text-xl opacity-80">
                Transform your videos and audio files by adding sign language interpretation, making your content
                accessible to the deaf and hard of hearing community.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                  <Link href="/upload">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-purple-700"
                >
                  <Link href="#how-it-works">
                    <span className="text-purple-700 hover:bg-white" >Learn More</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="md:w-1/2">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  {/* Video Player Mockup */}
                  <div className="bg-gray-900 rounded-lg p-4 aspect-video relative">
                    <div className="absolute inset-4 bg-gradient-to-br from-purple-400 to-indigo-400 rounded opacity-80"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    {/* Sign Language Interpreter Box */}
                    <div className="absolute bottom-4 right-4 w-20 h-16 bg-white/90 rounded border-2 border-purple-300 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  {/* Features Icons */}
                  <div className="flex justify-center space-x-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/20 p-3 rounded-full mb-2">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-sm">Upload</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/20 p-3 rounded-full mb-2">
                        <Video className="h-6 w-6" />
                      </div>
                      <span className="text-sm">Process</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white/20 p-3 rounded-full mb-2">
                        <Accessibility className="h-6 w-6" />
                      </div>
                      <span className="text-sm">Accessible</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Sign-opsis Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our technology makes it easy to add sign language interpretation to any video or audio content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Upload className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Upload Your Media</CardTitle>
                <CardDescription>Upload any video or audio file through our simple interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our system accepts most common video formats including MP4, MOV, and AVI, as well as audio formats
                  like MP3, WAV, and AAC.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>AI Processing</CardTitle>
                <CardDescription>Our advanced AI translates speech to sign language.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sign-opsis processes your media using advanced AI to analyze the audio and generate accurate sign
                  language interpretation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mb-2" />
                <CardTitle>Accessible Content</CardTitle>
                <CardDescription>Receive your media with embedded sign language interpretation.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Download your accessible video content in MP4 format, ready to play in any browser or device.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/upload">
                Try Sign-opsis Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Sign-opsis</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our solution offers numerous benefits for content creators and viewers alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-purple-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Content Creators</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-purple-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Reach a wider audience with accessible content</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Comply with accessibility regulations</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Demonstrate commitment to inclusion</span>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Viewers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Access content in your preferred language</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Enjoy seamless integration of sign language</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Better comprehension and engagement with content</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Sign-opsis</h2>
              <p className="text-gray-400 mt-2">Making media accessible through Sign Language</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <Link href="/upload" className="hover:text-purple-400 transition-colors">
                Upload
              </Link>
              <Link href="#how-it-works" className="hover:text-purple-400 transition-colors">
                How It Works
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                About Us
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Sign-opsis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
