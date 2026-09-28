"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, BookOpen, Sparkles } from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text"

export default function Home() {
  return (
    <>
      <Header />

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden
                       bg-gradient-to-br from-primary/8 via-accent/4 to-background
                       dark:from-primary/45 dark:via-accent/22 dark:to-background
                       transition-colors duration-700">
        {/* decorative background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-40 w-[520px] h-[520px] rounded-full
                          bg-[radial-gradient(ellipse_at_center,rgba(120,120,120,0.15),transparent_40%)]
                          dark:bg-[radial-gradient(ellipse_at_center,rgba(200,200,200,0.22),transparent_45%)]
                          blur-3xl opacity-80 animate-blob" />
          <div className="absolute right-[-120px] top-0 w-[420px] h-[420px] rounded-full
                          bg-[radial-gradient(ellipse_at_center,rgba(90,90,90,0.12),transparent_40%)]
                          dark:bg-[radial-gradient(ellipse_at_center,rgba(170,170,170,0.18),transparent_45%)]
                          blur-2xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute left-1/2 bottom-[-160px] w-[680px] h-[360px] -translate-x-1/2
                          bg-[linear-gradient(90deg,rgba(150,150,150,0.08),rgba(110,110,110,0.06))]
                          dark:bg-[linear-gradient(90deg,rgba(200,200,200,0.10),rgba(150,150,150,0.08))]
                          rounded-3xl blur-2xl opacity-60 animate-gradient" />
        </div>

        <div className="container mx-auto px-4 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-8 max-w-4xl mx-auto py-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-6 py-2 text-lg bg-card/70 backdrop-blur-sm border-primary/20 text-primary font-medium shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Welcome to
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-4"
            >
              {/* Japanese muted text */}
              <div className="text-2xl text-muted-foreground/90 tracking-wide">
                心のつながり
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground drop-shadow-lg">
                <span className="text-foreground text-7xl">
                  Inner
                </span>
                <br />
                <AuroraText className="bg-clip-text text-transparent">
                Heartspace
                </AuroraText>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Where hearts connect and stories unfold ✨
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 md:gap-8 py-8"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">Heartfelt Connections</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">Community Spirit</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm md:text-base">Shared Stories</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <Button
                size="lg"
                aria-label="Join our community"
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Join Our Community
              </Button>

              <Button
                variant="outline"
                size="lg"
                aria-label="Explore stories"
                className="px-8 py-3 text-lg font-semibold border border-primary/20 text-foreground hover:bg-accent/10 dark:hover:bg-accent/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
              >
                Explore Stories
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="pt-12"
            >
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full opacity-60"></div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  )
}