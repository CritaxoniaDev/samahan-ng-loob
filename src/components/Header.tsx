"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    // small mounted guard to avoid reading theme before client mount (prevents hydration mismatch)
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMenuOpen(false)
        }
        const handleClickOutside = () => {
            if (isMenuOpen) setIsMenuOpen(false)
        }

        if (isMenuOpen) {
            document.addEventListener("keydown", handleEscape)
            document.addEventListener("click", handleClickOutside)
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isMenuOpen])

    const navItems = [
        { href: "#home", label: "Home" },
        { href: "#stories", label: "Stories" },
        { href: "#community", label: "Community" },
        { href: "#about", label: "About" },
    ]

    const toggleTheme = () => {
        if (!mounted) return
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/95 backdrop-blur-lg border-b border-border/80 shadow-sm"
                    : "bg-background/80 backdrop-blur-md border-b border-border/50",
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex flex-col" style={{ fontFamily: 'var(--font-caveat), var(--font-kalam), cursive' }}>
                            {/* use text-foreground (root var) which will reflect dark mode via .dark class */}
                            <span className="font-bold text-foreground text-2xl leading-none">Samahan</span>
                            <span className="text-base text-muted-foreground leading-none -mt-0.5">ng loob</span>
                        </div>
                    </div>

                    {/* <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="relative px-4 py-2 text-black dark:text-white hover:text-foreground transition-all duration-200 rounded-lg hover:bg-accent/50 group"
                            >
                                <span className="relative z-10">{item.label}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </a>
                        ))}
                    </nav> */}

                    <div className="hidden md:flex items-center space-x-3">
                        {/* theme toggle - only interactive after mount to avoid hydration issues */}
                        <button
                            aria-label="Toggle theme"
                            onClick={toggleTheme}
                            className="p-2 rounded-md hover:bg-accent/40 transition-colors duration-200"
                        >
                            {mounted && (theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />)}
                            {!mounted && <div className="w-5 h-5" />} {/* placeholder to keep layout stable */}
                        </button>
                    </div>

                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 relative z-50"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMenuOpen(!isMenuOpen)
                        }}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="relative w-6 h-6">
                            <Menu
                                className={cn(
                                    "w-5 h-5 text-foreground absolute top-0.5 left-0.5 transition-all duration-300",
                                    isMenuOpen ? "opacity-0 rotate-180 scale-75" : "opacity-100 rotate-0 scale-100",
                                )}
                            />
                            <X
                                className={cn(
                                    "w-5 h-5 text-foreground absolute top-0.5 left-0.5 transition-all duration-300",
                                    isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-180 scale-75",
                                )}
                            />
                        </div>
                    </button>
                </div>

                <div
                    className={cn(
                        "md:hidden overflow-hidden transition-all duration-300 ease-out",
                        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="py-6 border-t border-border/50">
                        <nav className="flex flex-col space-y-1">
                            {/* {navItems.map((item, index) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-3 text-black dark:text-white hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg transform",
                                        isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                                    )}
                                    style={{
                                        transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                                    }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))} */}

                            <div
                                className={cn(
                                    "flex flex-col space-y-3 pt-6 px-4 transform transition-all duration-300",
                                    isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                                )}
                                style={{
                                    transitionDelay: isMenuOpen ? `${navItems.length * 50}ms` : "0ms",
                                }}
                            >
                                {/* mobile theme toggle */}
                                <div className="pt-2">
                                    <button
                                        aria-label="Toggle theme"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleTheme()
                                        }}
                                        className="p-2 rounded-md hover:bg-accent/40 transition-colors duration-200"
                                    >
                                        {mounted && (theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />)}
                                        {!mounted && <div className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}