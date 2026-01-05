import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { currentUser } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import pool from "@/lib/db"
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await currentUser()
    
    // Get locale from cookie
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
    
    // Import messages for the current locale
    const messages = (await import(`@/../messages/${locale}.json`)).default

    if (!user) {
        redirect("/login")
    }

    // Check if user has completed onboarding
    try {
        const result = await pool.query(
            "SELECT onboarding_completed FROM users WHERE id = $1",
            [user.id]
        )
        
        // If user doesn't exist in database, sync them first
        if (result.rows.length === 0) {
            // Create user in database
            await pool.query(
                `INSERT INTO users (
                    id, email, first_name, last_name, image_url, 
                    auth_provider, subscription_tier, onboarding_completed
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING`,
                [
                    user.id,
                    user.emailAddresses[0]?.emailAddress || "",
                    user.firstName || null,
                    user.lastName || null,
                    user.imageUrl || null,
                    "clerk",
                    "free",
                    false,
                ]
            )
            // Redirect to onboarding for new users
            redirect("/onboarding")
        } else if (!result.rows[0].onboarding_completed) {
            redirect("/onboarding")
        }
    } catch (error) {
        console.error("Error checking onboarding status:", error)
        // On error, redirect to onboarding to be safe
        redirect("/onboarding")
    }

    return (
        <NextIntlClientProvider messages={messages}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Overview</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="ml-auto flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}</span>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8"
                                    }
                                }}
                                afterSignOutUrl="/"
                            />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </NextIntlClientProvider>
    )
}
