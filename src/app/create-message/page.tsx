'use client'


import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { createMessage } from '@/lib/db'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import Image from 'next/image'
import SignatureCanvas from 'react-signature-canvas'
import { Header } from '@/components/Header'

export default function CreateMessage() {
    const [message, setMessage] = useState('')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [generatedLink, setGeneratedLink] = useState('')
    const [selectedTheme, setSelectedTheme] = useState('romantic')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [recipient, setRecipient] = useState('')
    const [signature, setSignature] = useState<string | null>(null)
    const signatureRef = useRef<SignatureCanvas>(null)

    const themes = [
        { id: 'romantic', emoji: '💝', name: 'Romantic' },
        { id: 'cute', emoji: '🌸', name: 'Cute' },
        { id: 'funny', emoji: '😊', name: 'Funny' },
        { id: 'friendship', emoji: '🤝', name: 'Friendship' }
    ]

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setSelectedImage(base64String) // This will store the image as base64
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGenerateLink = async () => {
        const messageData = {
            message,
            image: selectedImage || '', // This will be the base64 string
            theme: selectedTheme
        };

        try {
            const messageId = await createMessage(messageData);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setGeneratedLink(`https://shnl.vercel.app/message/${messageId}`);
        } catch (error) {
            console.error('Error creating message:', error);
        }
    };

    const formatText = (text: string) => {
        return text
            .split('\n')
            .map(line => {
                // Bold
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                // Italic
                line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
                // Underline
                line = line.replace(/\_\_(.*?)\_\_/g, '<u>$1</u>')
                // Headers
                line = line.replace(/^# (.*$)/gm, '<h1>$1</h1>')
                line = line.replace(/^## (.*$)/gm, '<h2>$1</h2>')
                // Lists
                line = line.replace(/^\- (.*$)/gm, '<li>$1</li>')
                return line
            })
            .join('<br/>')
    }

    return (
        <>
            <Header />
            <div
                className="min-h-screen bg-white p-8"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            linear-gradient(45deg, #f3e7ff 0%, #ffffff 100%)
        `,
                    backgroundSize: '20px 20px, 20px 20px, 400% 400%',
                    animation: 'gradient 15s ease infinite'
                }}
            >
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center space-y-4 py-12">
                        <h1
                            className="mb-10 text-5xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x hover:scale-105 hover:rotate-1 transition-all duration-300"
                            style={{
                                textShadow: `
                        2px 2px 0 #4a5568,
                        -2px -2px 0 #4a5568,
                        2px -2px 0 #4a5568,
                        -2px 2px 0 #4a5568,
                        4px 4px 8px rgba(0,0,0,0.2),
                        0 8px 16px rgba(0,0,0,0.3),
                        0 16px 32px rgba(0,0,0,0.15)
                    `,
                                transform: 'perspective(1000px) rotateX(10deg)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextStroke: '2px rgba(255,255,255,0.1)'
                            }}
                        >
                            Create Your Message
                        </h1>
                        <p className="text-gray-600 italic mb-10">
                            Share your feelings with style ✨
                        </p>
                        <div className="container mx-auto max-w-7xl">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Left Side - Message Creation Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-full"
                                >
                                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] p-8 space-y-8 relative overflow-hidden border border-purple-100">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />

                                        <motion.h1
                                            className="text-4xl font-permanent-marker text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            ✨ Create Your Message ✨
                                        </motion.h1>

                                        <div className="space-y-8">
                                            {/* Theme Selection */}
                                            <div className="flex flex-wrap justify-center gap-4 py-4">
                                                {themes.map((theme) => (
                                                    <motion.button
                                                        key={theme.id}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-lg ${selectedTheme === theme.id
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                                                            : 'bg-white hover:bg-purple-50'
                                                            }`}
                                                        onClick={() => setSelectedTheme(theme.id)}
                                                    >
                                                        <span className="text-xl">{theme.emoji}</span>
                                                        <span className="font-medium">{theme.name}</span>
                                                    </motion.button>
                                                ))}
                                            </div>

                                            {/* Recipient Input */}
                                            <div className="relative group">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
                                                <div className="relative bg-white rounded-xl p-2">
                                                    <label className="block text-sm font-medium text-purple-600 mb-1 ml-2">✨ To</label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter recipient's name"
                                                        value={recipient}
                                                        onChange={(e) => setRecipient(e.target.value)}
                                                        className="border-0 text-lg font-medium focus:ring-0 placeholder:text-gray-400 bg-transparent"
                                                    />
                                                </div>
                                            </div>

                                            {/* Message Input */}
                                            <div className="relative group">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
                                                <div className="relative bg-white rounded-xl overflow-hidden">
                                                    {/* Toolbar */}
                                                    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                                                        <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-200">
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1" title="Heading 1">
                                                                <span className="font-bold text-sm">H1</span>
                                                            </button>
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1" title="Heading 2">
                                                                <span className="font-bold text-sm">H2</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-200">
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Bold">
                                                                <strong>B</strong>
                                                            </button>
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Italic">
                                                                <em>I</em>
                                                            </button>
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Underline">
                                                                <span className="underline">U</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-200">
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Bullet List">
                                                                <span className="text-lg">•</span>
                                                            </button>
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Numbered List">
                                                                <span className="text-sm font-medium">1.</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-1 px-2 py-1">
                                                            <button className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors" title="Code">
                                                                <span className="font-mono text-sm">{`<>`}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Editor Area */}
                                                    <div className="p-4">
                                                        <Textarea
                                                            placeholder="Pour your heart out here... ✨"
                                                            className="min-h-[200px] border-0 text-lg font-medium focus:ring-0 resize-none bg-transparent placeholder:text-gray-400 w-full"
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Status Bar */}
                                                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
                                                        <div className="flex items-center gap-4">
                                                            <span>Markdown</span>
                                                            <span>|</span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                Ready
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span>{message.length} characters</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg"
                                            >
                                                <label className="block text-xl font-medium mb-4 text-purple-700 text-center">
                                                    ✍️ Your Signature
                                                </label>
                                                <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
                                                    <SignatureCanvas
                                                        ref={signatureRef}
                                                        canvasProps={{
                                                            className: "w-full h-40"
                                                        }}
                                                        onEnd={() => {
                                                            const dataUrl = signatureRef.current?.getTrimmedCanvas().toDataURL()
                                                            setSignature(dataUrl || null)
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-end mt-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-sm hover:bg-purple-100"
                                                        onClick={() => {
                                                            signatureRef.current?.clear()
                                                            setSignature(null)
                                                        }}
                                                    >
                                                        Clear ✨
                                                    </Button>
                                                </div>
                                            </motion.div>

                                            {/* Image Upload */}
                                            <motion.div

                                                className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg"
                                            >
                                                <label className="block text-xl font-medium mb-4 text-purple-700 text-center">
                                                    🖼️ Upload Your Image
                                                </label>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full mb-4 bg-white/50 backdrop-blur-sm border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300"
                                                >
                                                    Choose Image
                                                </Button>

                                                <motion.div
                                                    className="mt-4 h-48 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-purple-300 flex items-center justify-center overflow-hidden group"

                                                >
                                                    {selectedImage ? (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={selectedImage}
                                                                alt="Uploaded preview"
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                                className="group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-purple-400">Image Preview</span>
                                                    )}
                                                </motion.div>
                                            </motion.div>

                                            {/* Create Button */}
                                            <motion.div
                                                className="flex justify-center pt-6"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Button
                                                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-permanent-marker transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 px-12 py-6 rounded-2xl text-xl"
                                                    onClick={handleGenerateLink}
                                                >
                                                    ✨ Create Magic ✨
                                                </Button>
                                            </motion.div>

                                            {/* Generated Link */}
                                            <AnimatePresence>
                                                {generatedLink && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="mt-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg"
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <h3 className="text-2xl font-permanent-marker text-center text-purple-700 mb-4">
                                                                🎉 Your Message is Ready! 🎉
                                                            </h3>
                                                            <p className="text-center font-medium text-gray-700 mb-4">
                                                                Share this magical link with someone special:
                                                            </p>
                                                            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between gap-4 shadow-inner">
                                                                <p className="text-purple-600 font-medium truncate">{generatedLink}</p>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="hover:bg-purple-100 transition-all duration-300"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(generatedLink)
                                                                        alert("Link copied to clipboard! Share the magic with someone special! ✨")
                                                                    }}
                                                                >
                                                                    📋 Copy Link
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="sticky top-24 h-fit"
                                >
                                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] p-8 space-y-6 border border-purple-100">
                                        <motion.h2
                                            className="text-3xl font-permanent-marker text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            ✨ Live Preview ✨
                                        </motion.h2>

                                        <div className="space-y-6">
                                            <motion.div
                                                className={`relative p-8 rounded-2xl shadow-lg transition-all duration-500 overflow-hidden ${selectedTheme === 'romantic' ? 'bg-gradient-to-r from-pink-50 to-purple-50' :
                                                    selectedTheme === 'cute' ? 'bg-gradient-to-r from-purple-50 to-pink-50' :
                                                        selectedTheme === 'funny' ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
                                                            'bg-gradient-to-r from-blue-50 to-purple-50'
                                                    }`}
                                                layout
                                                layoutId="preview-container"
                                            >
                                                {/* Decorative Elements */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />
                                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30" />

                                                {/* Content Container */}
                                                <div className="relative z-10">
                                                    {selectedImage && (
                                                        <motion.div
                                                            className="relative w-full h-64 rounded-xl overflow-hidden mb-6 shadow-xl ring-4 ring-white/50"
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ duration: 0.4 }}
                                                        >
                                                            <Image
                                                                src={selectedImage}
                                                                alt="Preview"
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                                className="hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                        </motion.div>
                                                    )}

                                                    {recipient && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-2xl font-permanent-marker bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
                                                        >
                                                            Dear {recipient},
                                                        </motion.div>
                                                    )}

                                                    <motion.div
                                                        className="prose max-w-none relative"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <motion.div
                                                            className="text-lg font-medium leading-relaxed text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-inner"
                                                            dangerouslySetInnerHTML={{
                                                                __html: formatText(message) || "Your heartfelt message will appear here..."
                                                            }}
                                                            layout
                                                            layoutId="message-content"
                                                        />
                                                    </motion.div>

                                                    {signature && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-6 flex flex-col items-end space-y-2"
                                                        >
                                                            <img
                                                                src={signature}
                                                                alt="Signature"
                                                                className="h-20 object-contain drop-shadow-md"
                                                            />
                                                            <div className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                                With love and affection ✨
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Theme Watermark */}
                                                <div className="absolute bottom-4 right-4 text-sm text-gray-400/50 font-medium">
                                                    {themes.find(t => t.id === selectedTheme)?.emoji}
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="flex items-center justify-center gap-2 text-sm font-medium bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-purple-100"
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <span className="text-gray-500">Theme:</span>
                                                <motion.span
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2"
                                                    layout
                                                >
                                                    {themes.find(t => t.id === selectedTheme)?.emoji}
                                                    {themes.find(t => t.id === selectedTheme)?.name}
                                                </motion.span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
