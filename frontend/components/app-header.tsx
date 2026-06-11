import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { DecorIcon } from "@/components/decor-icon";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { MapsBreadcrumb } from "@/components/maps/maps-breadcrumb";
import { getNavLinks } from "@/components/app-shared";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { NavUser } from "@/components/nav-user";
import { TrendingDownIcon, RoadHorizonIcon, FuelIcon } from "@/components/ui/phosphor-icons";

const MAP_PAGES: Record<string, { label: string; icon: React.ReactNode }> = {
	"/dashboard/poverty": { label: "Peta Kemiskinan", icon: <TrendingDownIcon className="size-3.5" /> },
	"/dashboard/land": { label: "Lahan dan Jalan", icon: <RoadHorizonIcon className="size-3.5" /> },
	"/dashboard/gas-station": { label: "SPBU dan Charger", icon: <FuelIcon className="size-3.5" /> },
};

export function AppHeader({ activePath, fullBleed = false, onExitFullBleed }: { activePath?: string; fullBleed?: boolean; onExitFullBleed?: () => void }) {
	const links = getNavLinks(activePath);
	const activeItem = links.find((item) => item.isActive);
	const mapPage = activePath ? MAP_PAGES[activePath] : undefined;

	return (
		<header
			className={cn(
				"sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6",
				"bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50"
			)}
		>
			<DecorIcon className="hidden md:block" position="bottom-left" />
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				{mapPage ? (
					<MapsBreadcrumb currentPage={mapPage.label} currentIcon={mapPage.icon} isLeafletOpen={fullBleed} onExitMap={onExitFullBleed} />
				) : (
					<AppBreadcrumbs page={activeItem} />
				)}
			</div>
			<div className="flex items-center gap-3">
				<NavUser />
			</div>
		</header>
	);
}
