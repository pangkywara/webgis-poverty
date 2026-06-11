import type { ReactNode } from "react";
import {
	FuelIcon,
	SettingsIcon,
	HelpCircleIcon,
	BookOpenIcon,
	TrendingDownIcon,
	RoadHorizonIcon,
	HouseIcon
} from "@/components/ui/phosphor-icons";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

const ROLE_ALLOWED_MAP_PATHS: Record<string, string[]> = {
	superadmin: ["/dashboard/poverty", "/dashboard/land", "/dashboard/gas-station"],
	admin_poverty: ["/dashboard/poverty"],
	admin_lands_roads: ["/dashboard/land"],
	admin_gas_stations: ["/dashboard/gas-station"],
};

const checkIsActive = (activePath?: string, itemPath?: string): boolean => {
	if (!activePath || !itemPath) return false;
	if (itemPath.startsWith("#")) return false; // Ignore hash placeholders
	if (itemPath === "/dashboard") {
		return activePath === "/dashboard";
	}
	return activePath === itemPath || activePath.startsWith(itemPath + "/");
};

export const getNavGroups = (activePath?: string, role?: string): SidebarNavGroup[] => {
	const allowedMapPaths = role ? (ROLE_ALLOWED_MAP_PATHS[role] ?? []) : null;

	const allMapItems = [
		{
			title: "Peta Kemiskinan",
			path: "/dashboard/poverty",
			icon: <TrendingDownIcon />,
		},
		{
			title: "Lahan & Jalan",
			path: "/dashboard/land",
			icon: <RoadHorizonIcon />,
		},
		{
			title: "SPBU & Charger",
			path: "/dashboard/gas-station",
			icon: <FuelIcon />,
		},
	];

	const mapItems = allMapItems
		.filter((item) => !allowedMapPaths || allowedMapPaths.includes(item.path))
		.map((item) => ({ ...item, isActive: checkIsActive(activePath, item.path) }));

	return [
		{
			label: "Ikhtisar",
			items: [
				{
					title: "Beranda",
					path: "/dashboard",
					icon: <HouseIcon />,
					isActive: checkIsActive(activePath, "/dashboard"),
				},
			],
		},
		{
			label: "Peta Visual",
			items: mapItems,
		},
		{
			label: "Administrasi",
			items: [
				{
					title: "Pengaturan",
					path: "/dashboard/settings",
					icon: <SettingsIcon />,
					isActive: checkIsActive(activePath, "/dashboard/settings"),
				},
			],
		},
	];
};

export const navGroups = getNavGroups();

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Pusat Bantuan",
		path: "#/help",
		icon: <HelpCircleIcon />,
	},
	{
		title: "Dokumentasi",
		path: "#/documentation",
		icon: <BookOpenIcon />,
	},
];

export const getNavLinks = (activePath?: string, role?: string): SidebarNavItem[] => [
	...getNavGroups(activePath, role).flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];

export const navLinks = getNavLinks();

