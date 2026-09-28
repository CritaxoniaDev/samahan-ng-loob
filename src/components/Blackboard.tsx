'use client'

import { useEffect, useRef, useState } from 'react'
import { ChalkboardCalendar } from '@/components/ChalkboardCalendar'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"

export interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timestamp: string;
  font: string;
}

export function Blackboard({ notes }: { notes: Note[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [currentDay, setCurrentDay] = useState(new Date().toDateString())
  const [date, setDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [hiddenNotes, setHiddenNotes] = useState<string[]>([])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
  
    if (y < 120) return
  
    const clickedNote = notes.find(note => {
      const buttonX = note.x + 180
      const buttonY = note.y + 20
      
      return Math.sqrt(Math.pow(x - buttonX, 2) + Math.pow(y - buttonY, 2)) < 20
    })
  
    if (clickedNote) {
      setHiddenNotes(prev => [...prev, clickedNote.id])
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawBlackboard(ctx, canvas.width, canvas.height, date)
        
        notes
          .filter(note => !hiddenNotes.includes(note.id) && note.id !== clickedNote.id)
          .forEach(note => {
            ctx.save()
            ctx.translate(note.x, note.y)
            ctx.rotate((Math.random() * 6 - 3) * Math.PI / 180)
  
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowBlur = 15
            ctx.shadowOffsetX = 8
            ctx.shadowOffsetY = 8
  
            const noteGradient = ctx.createLinearGradient(0, 0, 200, 200)
            noteGradient.addColorStop(0, note.color)
            noteGradient.addColorStop(1, adjustColor(note.color))
            ctx.fillStyle = noteGradient
  
            roundRect(ctx, 0, 0, 200, 200, 5)
  
            ctx.shadowColor = 'transparent'
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
            ctx.beginPath()
            ctx.arc(180, 20, 12, 0, Math.PI * 2)
            ctx.fill()
  
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('×', 180, 20)
  
            ctx.shadowColor = 'transparent'
            ctx.fillStyle = '#333'
            ctx.font = `18px "${note.font}"`
            ctx.textAlign = 'left'
  
            wrapText(ctx, note.text, 10, 30, 180, 22)
  
            ctx.font = '12px Arial'
            ctx.fillStyle = '#666'
            ctx.fillText(note.timestamp, 10, 180)
  
            ctx.restore()
          })
      }
      return
    }
  
    notes.forEach(note => {
      if (
        !hiddenNotes.includes(note.id) &&
        x >= note.x &&
        x <= note.x + 200 &&
        y >= note.y &&
        y <= note.y + 200
      ) {
        setSelectedNote(note)
      }
    })
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setShowCalendar(false)
      // Redraw blackboard with the new date
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawBlackboard(ctx, canvas.width, canvas.height, newDate)
        }
      }
    }
  }

  const filterNotesByDate = (notes: Note[], selectedDate: Date) => {
    return notes.filter(note => {
      const noteDate = new Date(note.timestamp)
      return (
        noteDate.getDate() === selectedDate.getDate() &&
        noteDate.getMonth() === selectedDate.getMonth() &&
        noteDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }

  useEffect(() => {
    const checkDay = () => {
      const newDay = new Date().toDateString()
      if (newDay !== currentDay) {
        setCurrentDay(newDay)
        // Clear the canvas and reset notes
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // Redraw empty blackboard
            drawBlackboard(ctx, canvas.width, canvas.height)
          }
        }
      }
    }

    // Check every minute for day change
    const interval = setInterval(checkDay, 60000)
    return () => clearInterval(interval)
  }, [currentDay, drawBlackboard])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw black chalkboard base
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.01)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add title and date
    ctx.save()
    ctx.font = '48px "Rock Salt"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('STICKY THOUGHTS', canvas.width / 2, 60)

    const displayDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    ctx.font = '24px "Indie Flower"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(displayDate, canvas.width / 2, 100)
    ctx.restore()

    // Add chalk dust texture
    for (let i = 0; i < canvas.width; i += 2) {
      for (let j = 0; j < canvas.height; j += 2) {
        if (Math.random() > 0.992) {
          const opacity = Math.random() * 0.1
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fillRect(i, j, 2, 2)
        }
      }
    }

    // Add chalk smudges
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 30 + 10

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.fill()
    }

    // Add eraser marks
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const width = Math.random() * 100 + 50
      const height = Math.random() * 20 + 10

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.random() * Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.fillRect(-width / 2, -height / 2, width, height)
      ctx.restore()
    }

    // Filter notes for selected date and draw them
    const filteredNotes = filterNotesByDate(notes, date)

    // Draw sticky notes
    filteredNotes.forEach((note) => {
      if (hiddenNotes.includes(note.id)) return;

      ctx.save()
      ctx.translate(note.x, note.y)
      ctx.rotate((Math.random() * 6 - 3) * Math.PI / 180)

      // Enhanced shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 8
      ctx.shadowOffsetY = 8

      // Note background with gradient
      const noteGradient = ctx.createLinearGradient(0, 0, 200, 200)
      noteGradient.addColorStop(0, note.color)
      noteGradient.addColorStop(1, adjustColor(note.color))
      ctx.fillStyle = noteGradient

      // Draw note with rounded corners
      roundRect(ctx, 0, 0, 200, 200, 5)

      // Draw X button
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.beginPath()
      ctx.arc(180, 20, 12, 0, Math.PI * 2)
      ctx.fill()

      // Draw X symbol
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('x', 180, 20)

      // Note content
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = '#333'
      ctx.font = `18px "${note.font}"`
      ctx.textAlign = 'left'

      // Word wrap text
      wrapText(ctx, note.text, 10, 30, 180, 22)

      // Timestamp
      ctx.font = '12px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(note.timestamp, 10, 180)

      ctx.restore()
    })

  }, [notes, date]) // Added date to dependency array

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
  }

  function adjustColor(color: string): string {
    return color;
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ')
    let line = ''

    words.forEach(word => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth) {
        ctx.fillText(line, x, y)
        line = word + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    })
    ctx.fillText(line, x, y)
  }

  function drawBlackboard(ctx: CanvasRenderingContext2D, width: number, height: number, selectedDate: Date = new Date()) {
    // Draw black chalkboard base
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, width, height)

    // Add subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.01)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add title and date
    ctx.save()
    ctx.font = '48px "Rock Salt"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('STICKY THOUGHTS', width / 2, 60)

    const displayDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    ctx.font = '24px "Indie Flower"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(displayDate, width / 2, 100)
    ctx.restore()

    // Add chalk dust and texture effects
    addChalkEffects(ctx, width, height)
  }

  function addChalkEffects(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Add chalk dust texture
    for (let i = 0; i < width; i += 2) {
      for (let j = 0; j < height; j += 2) {
        if (Math.random() > 0.992) {
          const opacity = Math.random() * 0.1
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fillRect(i, j, 2, 2)
        }
      }
    }

    // Add chalk smudges and eraser marks
    addDecorations(ctx, width, height)
  }

  function addDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Add chalk smudges
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 30 + 10

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.fill()
    }

    // Add eraser marks
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const w = Math.random() * 100 + 50
      const h = Math.random() * 20 + 10

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.random() * Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'
      ctx.fillRect(-w / 2, -h / 2, w, h)
      ctx.restore()
    }
  }

  return (
    <>
      <div className="relative">
        <div className="relative">
          <Button
            variant="outline"
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 group"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white/80 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </Button>

          {showCalendar && (
            <div className="absolute top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <ChalkboardCalendar onSelect={handleDateSelect} selectedDate={date} />
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-[800px] rounded-lg shadow-inner cursor-pointer"
          style={{
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)',
            border: '12px solid #2b2b2b',
          }}
        />


        <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
          <DialogContent className="max-w-md backdrop-blur-sm border-none shadow-xl">
            <DialogHeader>
              <DialogTitle className="sr-only">Sticky Note Details</DialogTitle>
            </DialogHeader>
            <div
              className="w-[400px] h-[400px] p-8 relative transition-all duration-300"
              style={{
                backgroundColor: selectedNote?.color,
                boxShadow: '2px 2px 15px rgba(0,0,0,0.2), -1px -1px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-300/30" />

              <div className="h-full flex flex-col">
                <p
                  className="text-xl flex-grow leading-relaxed overflow-auto"
                  style={{
                    fontFamily: selectedNote?.font,
                    textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)'
                  }}
                >
                  {selectedNote?.text}
                </p>

                <div className="font-inter text-sm text-gray-600/80 pt-4 border-t border-black/10">
                  {selectedNote?.timestamp}
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-12 h-12 bg-black/5" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
