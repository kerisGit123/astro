import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Sun, Repeat } from "lucide-react"

export function WhyChoose() {
    return (
        <section className="container px-4 md:px-6 py-20 mx-auto">
            <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Why Combine Systems?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    We integrate ancient wisdom to remove the blind spots of single-method readings.
                </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
                    <CardHeader>
                        <Compass className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>紫微斗數 (Zi Wei Dou Shu)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Reviews your <span className="text-foreground font-medium">life structure & timing</span>. It acts as the map of your potential and the clock of your opportunities.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-secondary/20 backdrop-blur-sm">
                    <CardHeader>
                        <Sun className="h-10 w-10 text-secondary mb-2" />
                        <CardTitle>Western Zodiac</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Explains your <span className="text-foreground font-medium">behavior & psychology</span>. Understand your drives, personality traits, and emotional needs.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
                    <CardHeader>
                        <Repeat className="h-10 w-10 text-blue-400 mb-2" />
                        <CardTitle>Chinese Zodiac</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Shows <span className="text-foreground font-medium">cycles & compatibility</span>. Reveals the underlying elemental balance and relationship harmony.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
