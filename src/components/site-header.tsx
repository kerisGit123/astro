import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { LanguageSwitcher } from "@/components/language-switcher"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <span className="font-bold text-xl tracking-tight text-primary">ZiWei Path</span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
                        <Link href="/#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60 scroll-smooth">Pricing</Link>
                        <Link href="/#astrology" className="transition-colors hover:text-foreground/80 text-foreground/60 scroll-smooth">Astrology</Link>
                        <Link href="/#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">How It Works</Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <SignedOut>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Get Started
                                </Button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8"
                                    }
                                }}
                                afterSignOutUrl="/"
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    )
}
