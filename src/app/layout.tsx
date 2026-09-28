import {
  Permanent_Marker,
  Indie_Flower,
  Caveat,
  Rock_Salt,
  Kalam,
  Shadows_Into_Light,
  Patrick_Hand,
  Architects_Daughter,
  Gloria_Hallelujah,
  Sacramento,
  Satisfy,
  Marck_Script
} from 'next/font/google'
import './globals.css'
import Providers from './providers'

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker'
})
const rockSalt = Rock_Salt({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-rock-salt'
})
const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-indie-flower'
})
const caveat = Caveat({ 
  subsets: ['latin'],
  variable: '--font-caveat'
})
const kalam = Kalam({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kalam'
})
const shadowsIntoLight = Shadows_Into_Light({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shadows-into-light'
})
const patrickHand = Patrick_Hand({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-patrick-hand'
})
const architectsDaughter = Architects_Daughter({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-architects-daughter'
})
const gloriaHallelujah = Gloria_Hallelujah({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gloria-hallelujah'
})
const sacramento = Sacramento({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sacramento'
})
const satisfy = Satisfy({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-satisfy'
})
const marckScript = Marck_Script({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marck-script'
})

export const metadata = {
  title: 'Sama ng Loob',
  description: 'A virtual blackboard for your thoughts',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`
        ${rockSalt.variable}
        ${permanentMarker.variable}
        ${indieFlower.variable}
        ${caveat.variable}
        ${kalam.variable}
        ${shadowsIntoLight.variable}
        ${patrickHand.variable}
        ${architectsDaughter.variable}
        ${gloriaHallelujah.variable}
        ${sacramento.variable}
        ${satisfy.variable}
        ${marckScript.variable}
      tracking-tight antialiased
      bg-gradient-to-br from-primary/10 via-accent/5 to-background
      dark:from-primary/50 dark:via-accent/30 dark:to-background
      transition-colors duration-500
      `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
