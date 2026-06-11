import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
	children,
	activePath,
	fullBleed,
	onExitFullBleed,
	hideHeader = false
}: {
	children: React.ReactNode;
	activePath?: string;
	fullBleed?: boolean;
	onExitFullBleed?: () => void;
	hideHeader?: boolean;
}) {
	return (
		<SidebarProvider className={cn("[--app-wrapper-max-width:80rem]", fullBleed && "h-screen overflow-hidden")}>
			<AppSidebar activePath={activePath} />
			<SidebarInset className={cn(fullBleed && "h-screen overflow-hidden flex flex-col")}>
				{!hideHeader && (
					<AppHeader activePath={activePath} fullBleed={fullBleed} onExitFullBleed={onExitFullBleed} />
				)}
				<div
					className={cn(
						"flex flex-1 flex-col",
						fullBleed
							? cn("p-0 max-w-none overflow-hidden", hideHeader ? "h-screen" : "h-[calc(100vh-3.5rem)]")
							: "p-4 md:p-6 mx-auto w-full max-w-(--app-wrapper-max-width)"
					)}
				>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
