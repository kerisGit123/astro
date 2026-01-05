import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t border-border/40 bg-background/95">
            <div className="container px-4 md:px-6 py-8 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © {new Date().getFullYear()} ZiWei Path. All rights reserved.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:underline hover:text-foreground">Terms of Use</Link>
                    <Link href="/privacy" className="hover:underline hover:text-foreground">Privacy Policy</Link>
                    <Link href="/disclaimer" className="hover:underline hover:text-foreground">Disclaimer</Link>
                    <Link href="/faq" className="hover:underline hover:text-foreground">FAQ</Link>
                </div>
            </div>
        </footer>
    )
}
