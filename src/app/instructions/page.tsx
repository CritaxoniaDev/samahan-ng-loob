import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-white p-8" style={{
      backgroundImage: `
        linear-gradient(to right, #f0f0f0 1px, transparent 1px),
        linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      <main className="max-w-4xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">
            How to Use Sama-han ng Loob
          </h1>
          <p className="text-gray-600 italic text-lg">
            Your complete guide to sharing thoughts on our virtual blackboard ✨
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <section className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <span className="text-3xl">✍️</span>
              </div>
              <h2 className="text-2xl font-permanent-marker bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Adding Your Thoughts
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center space-x-2">
                    <span className="text-purple-500 font-bold">1.</span>
                    <span>Find the input form at the top</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-purple-500 font-bold">2.</span>
                    <span>Enter your name (optional)</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-purple-500 font-bold">3.</span>
                    <span>Write your thoughts</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-purple-500 font-bold">4.</span>
                    <span>Press Ctrl + Enter or click Add</span>
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">
                    💡 Pro tip: Your note will be assigned a random color and handwriting style!
                  </p>
                </div>
              </div>
              <div className="relative h-[200px] rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src="/assets/instruction-1.png" 
                  alt="Adding a note demonstration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-pink-100 p-4 rounded-full">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-2xl font-permanent-marker bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Viewing Notes
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center space-x-2">
                    <span className="text-pink-500">•</span>
                    <span>Click any note to view full content</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-pink-500">•</span>
                    <span>Notes appear in random positions</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="text-pink-500">•</span>
                    <span>Each note shows its timestamp</span>
                  </p>
                </div>
              </div>
              <div className="relative h-[200px] rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src="/assets/instruction-2.png" 
                  alt="Viewing a note demonstration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-3xl">🎨</span>
              </div>
              <h2 className="text-2xl font-permanent-marker bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Special Features
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: '🎨', title: 'Random Colors', desc: 'Each note gets a unique pastel shade' },
                { icon: '✍️', title: 'Handwriting', desc: 'Various font styles for personality' },
                { icon: '🎯', title: 'Smart Position', desc: 'Notes avoid overlapping' },
                { icon: '⏰', title: 'Timestamps', desc: 'Know when thoughts were shared' },
                { icon: '🖼️', title: 'Realistic Board', desc: 'Authentic blackboard feel' },
                { icon: '✨', title: 'Animations', desc: 'Smooth interactive effects' },
              ].map((feature, i) => (
                <div key={i} className="bg-white/50 p-4 rounded-lg space-y-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <h3 className="font-bold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="text-center pt-8">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-lg">
              Return to Canvas ✨
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
