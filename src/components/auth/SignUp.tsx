"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password) {
      setError("Please fill all required fields.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Signup failed")
      }
      setSuccess(true)
      // small delay to show success then redirect to home
      setTimeout(() => router.push("/"), 1200)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/6 to-background p-6">
      <div className="relative w-full max-w-lg">
        {/* decorative gradient border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/10 blur opacity-30 pointer-events-none" />
        {/* glass card */}
        <div className="relative bg-white/30 dark:bg-black/30 backdrop-blur-3xl border border-white/10 dark:border-white/6 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <Badge className="mx-auto mb-3">Create account</Badge>
            <h1 className="text-2xl font-bold text-foreground">Join Sama-han</h1>
            <p className="text-sm text-muted-foreground mt-1">Share your heart, join the community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-foreground">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="bg-transparent border border-black/70 dark:border-white/30 placeholder:text-muted-foreground/70 focus:border-primary/60 rounded-md px-3 py-2 transition"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-transparent border border-black/70 dark:border-white/30 placeholder:text-muted-foreground/70 focus:border-primary/60 rounded-md px-3 py-2 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-transparent border border-black/70 dark:border-white/30 placeholder:text-muted-foreground/70 focus:border-primary/60 rounded-md px-3 py-2 transition"
                />
              </div>

              <div>
                <Label htmlFor="confirm" className="text-sm text-foreground">Confirm</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-transparent border border-black/70 dark:border-white/30 placeholder:text-muted-foreground/70 focus:border-primary/60 rounded-md px-3 py-2 transition"
                />
              </div>
            </div>

            {error && <div className="text-sm text-destructive mt-1">{error}</div>}
            {success && <div className="text-sm text-primary mt-1">Account created — redirecting...</div>}

            <div className="flex items-center gap-3 mt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading || success}
              >
                {loading ? "Creating…" : "Sign up"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                disabled={loading}
                className="text-foreground"
              >
                Cancel
              </Button>
            </div>

            <div className="pt-4 text-center text-xs text-muted-foreground">
              By signing up you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}