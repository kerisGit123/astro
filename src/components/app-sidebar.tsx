"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, User, Heart, Settings, LogOut, Users, Briefcase, Home, Star, ChevronDown, Calendar, CalendarDays, Sparkles } from "lucide-react"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "next-intl"

export function AppSidebar() {
    const { signOut } = useClerk()
    const router = useRouter()
    const t = useTranslations('nav')

    const items = [
        {
            titleKey: "overview",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            titleKey: "people",
            url: "/dashboard/people",
            icon: Users,
        },
        {
            titleKey: "destiny",
            url: "/dashboard/report",
            icon: User,
        },
        {
            titleKey: "settings",
            url: "/dashboard/settings",
            icon: Settings,
        },
    ]

    const compatibilityItems = [
        {
            titleKey: "love",
            url: "/dashboard/compatibility?type=love",
            icon: Heart,
        },
        {
            titleKey: "business",
            url: "/dashboard/compatibility?type=business",
            icon: Briefcase,
        },
        {
            titleKey: "team",
            url: "/dashboard/compatibility?type=work",
            icon: Users,
        },
        {
            titleKey: "family",
            url: "/dashboard/compatibility?type=family",
            icon: Home,
        },
        {
            titleKey: "friendship",
            url: "/dashboard/compatibility?type=friend",
            icon: Star,
        },
    ]

    const predictionItems = [
        {
            titleKey: "monthlyPrediction",
            url: "/dashboard/monthly-prediction",
            icon: Calendar,
        },
        {
            titleKey: "yearlyPrediction",
            url: "/dashboard/yearly-prediction",
            icon: CalendarDays,
        },
        {
            titleKey: "zodiacAnalysis",
            url: "/dashboard/zodiac-analysis",
            icon: Sparkles,
        },
    ]

    const handleSignOut = async () => {
        await signOut()
        router.push("/")
    }

    return (
        <Sidebar>
            <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border">
                <span className="font-bold text-lg tracking-tight text-primary">ZiWei Path</span>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('menu')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.titleKey}>
                                    <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{t(item.titleKey)}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('compatibility')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {compatibilityItems.map((item) => (
                                <SidebarMenuItem key={item.titleKey}>
                                    <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{t(item.titleKey)}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('predictions')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {predictionItems.map((item) => (
                                <SidebarMenuItem key={item.titleKey}>
                                    <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{t(item.titleKey)}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('language')}</SidebarGroupLabel>
                    <SidebarGroupContent className="px-2">
                        <LanguageSwitcher />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            <span>{t('logout')}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
