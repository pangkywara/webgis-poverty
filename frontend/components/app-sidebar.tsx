"use client";

import { cn } from "@/lib/utils";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { footerNavLinks, getNavGroups } from "@/components/app-shared";
import { NavGroup } from "@/components/nav-group";
import { useAuth } from "@/lib/auth-context";

export function AppSidebar({ activePath }: { activePath?: string }) {
	const { user } = useAuth();
	const groups = getNavGroups(activePath, user?.role);

	return (
		<Sidebar
			className={cn(
				"*:data-[slot=sidebar-inner]:bg-background",
				"*:data-[slot=sidebar-inner]:dark:bg-[radial-gradient(60%_18%_at_10%_0%,--theme(--color-foreground/.08),transparent)]",
				
				// Default text/icon colors for sidebar buttons (faded)
				"**:data-[slot=sidebar-menu-button]:[&>span]:text-foreground/60",
				"**:data-[slot=sidebar-menu-button]:[&>svg]:text-foreground/50",
				"**:data-[slot=sidebar-menu-button]:[&>span]:transition-colors",
				"**:data-[slot=sidebar-menu-button]:[&>svg]:transition-colors",
				
				// Hover states for sidebar buttons
				"**:data-[slot=sidebar-menu-button]:hover:bg-sidebar-accent/50",
				"**:data-[slot=sidebar-menu-button]:hover:[&>span]:text-foreground",
				"**:data-[slot=sidebar-menu-button]:hover:[&>svg]:text-foreground",
				
				// Active state (Vermilion Pulse theme color)
				"**:data-[slot=sidebar-menu-button]:data-[active]:bg-primary/10!",
				"**:data-[slot=sidebar-menu-button]:data-[active]:[&>span]:text-primary!",
				"**:data-[slot=sidebar-menu-button]:data-[active]:[&>span]:font-semibold",
				"**:data-[slot=sidebar-menu-button]:data-[active]:[&>svg]:text-primary!",
				"**:data-[slot=sidebar-menu-button]:data-[active]:hover:bg-primary/15!",
				
				// Default text/icon colors for sidebar sub-buttons (faded)
				"**:data-[slot=sidebar-menu-sub-button]:[&>span]:text-foreground/60",
				"**:data-[slot=sidebar-menu-sub-button]:[&>span]:transition-colors",
				
				// Hover states for sub-buttons
				"**:data-[slot=sidebar-menu-sub-button]:hover:bg-sidebar-accent/50",
				"**:data-[slot=sidebar-menu-sub-button]:hover:[&>span]:text-foreground",
				
				// Active state for sub-buttons
				"**:data-[slot=sidebar-menu-sub-button]:data-[active]:bg-primary/10!",
				"**:data-[slot=sidebar-menu-sub-button]:data-[active]:[&>span]:text-primary!",
				"**:data-[slot=sidebar-menu-sub-button]:data-[active]:[&>span]:font-semibold",
				"**:data-[slot=sidebar-menu-sub-button]:data-[active]:hover:bg-primary/15!"
			)}
			collapsible="icon"
			variant="sidebar"
		>
			<SidebarHeader className="h-14 justify-center border-b px-2">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<SidebarMenuButton render={<a href="/dashboard" />}><img src="/waras_io/favicon-32x32.png" className="size-5 shrink-0 rounded" alt="Waras Logo" /><span className="font-medium text-foreground!">Waras</span></SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{groups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>
			<SidebarFooter className="gap-0 p-0">
				<SidebarMenu className="border-t p-2">
					{footerNavLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton className="text-muted-foreground" isActive={item.isActive} size="sm" tooltip={item.title} render={<a href={item.path} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<div className="px-4 pt-4 pb-2 transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0">
					<p className="text-nowrap text-[9px] text-muted-foreground">
						© {new Date().getFullYear()} Waras
					</p>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
