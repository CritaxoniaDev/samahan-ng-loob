'use client'

import { useEffect, useState } from 'react'
import { getMessage } from '@/lib/db'
import { Message } from '@/lib/db'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import confetti from 'canvas-confetti'

const cardVariants = {
    initial: {
        scale: 0,
        opacity: 0,
        rotateY: 180
    },
    animate: {
        scale: 1,
        opacity: 1,
        rotateY: 0,
        transition: {
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96]
        }
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: {
            duration: 0.5
        }
    }
}

const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: {
            delay: 0.5,
            duration: 0.5
        }
    }
}

export default function ViewMessage() {
    const params = useParams()
    const [message, setMessage] = useState<Message | null>(null)
    const [loading, setLoading] = useState(true)
    const [showCard, setShowCard] = useState(false)

    useEffect(() => {
        const fetchMessage = async () => {
            const data = await getMessage(params.id as string)
            setMessage(data)
            setLoading(false)
            setTimeout(() => {
                setShowCard(true)
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            }, 300)
        }
        fetchMessage()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-100 to-teal-100">
                <Card className="w-96 h-48 backdrop-blur-sm bg-white/30">
                    <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="animate-spin text-3xl">✨</span>
                            <Skeleton className="h-8 w-[250px]" />
                        </div>
                        <Skeleton className="h-4 w-[200px]" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!message) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100">
                <Card className="w-96 backdrop-blur-sm bg-white/30">
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <span className="text-6xl animate-bounce">💔</span>
                        <h2 className="text-2xl font-permanent-marker text-red-600">Message not found</h2>
                        <p className="text-gray-600 text-center">This message may have been deleted or never existed</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 perspective-[1000px]">
            <AnimatePresence>
                {showCard && (
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`w-full max-w-2xl ${
                            message.theme === 'romantic'
                                ? 'bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100'
                                : message.theme === 'cute'
                                ? 'bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100'
                                : message.theme === 'funny'
                                ? 'bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100'
                                : 'bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100'
                        }`}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
                            <CardContent className="p-8">
                                <motion.div
                                    variants={contentVariants}
                                    className="space-y-8"
                                >
                                    {message.image && (
                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="relative w-full h-80 rounded-xl overflow-hidden ring-2 ring-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
                                        >
                                            <Image
                                                src={message.image}
                                                alt="Message image"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className="group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 }}
                                        className="relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                                        <div
                                            className="text-xl font-medium leading-relaxed text-gray-800 backdrop-blur-sm bg-white/30 p-6 rounded-xl"
                                            dangerouslySetInnerHTML={{ __html: message.message }}
                                        />
                                    </motion.div>

                                    <motion.footer
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4 }}
                                        className="text-center space-y-3"
                                    >
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            ✨ A special message created ✨
                                        </p>
                                    </motion.footer>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
