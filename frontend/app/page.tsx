"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Headphones, Video, Languages, Accessibility } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import HeroAnimation from "@/components/hero-animation"

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                The Gist with a Twist (of the Wrist!)
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Making Media Accessible Through{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Sign Language
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Convert audio and video content into sign language videos with our AI-powered avatar interpreter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                asChild
              >
                <Link href="/upload">
                  Try It Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden border bg-background/50 p-4">
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Rest of the component remains unchanged */}
      <section
        ref={featuresRef}
        className="py-20 bg-gradient-to-b from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Sign-opsis Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our technology bridges the gap between audio content and sign language, making media accessible to
              everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Headphones className="h-10 w-10 text-teal-500" />}
              title="Audio Processing"
              description="Upload any audio or video file and our AI will transcribe the content with high accuracy."
            />
            <FeatureCard
              icon={<Languages className="h-10 w-10 text-cyan-500" />}
              title="Language Translation"
              description="Convert spoken language to sign language grammar structure for natural signing."
            />
            <FeatureCard
              icon={<Video className="h-10 w-10 text-teal-500" />}
              title="Avatar Generation"
              description="Watch our 3D avatar perform sign language that's synchronized with the original content."
            />
            <FeatureCard
              icon={<Accessibility className="h-10 w-10 text-cyan-500" />}
              title="Accessibility Options"
              description="Customize playback speed, toggle subtitles, and adjust avatar visibility to your preference."
            />
          </div>
        </div>
      </section>

      <section className="py-20 container">
        <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 p-8 md:p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to make your content accessible?</h2>
              <p className="text-white/90 text-lg">
                Join thousands of content creators who are making their media accessible to the deaf and hard of hearing
                community.
              </p>
            </div>
            <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 hover:text-teal-700" asChild>
              <Link href="/upload">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
