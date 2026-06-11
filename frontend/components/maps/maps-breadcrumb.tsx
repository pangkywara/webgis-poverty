"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { HouseIcon, GlobeHemisphereWestIcon, CaretDoubleRightIcon } from "@/components/ui/phosphor-icons";
import type { ReactNode } from "react";

interface MapsBreadcrumbProps {
	currentPage: string;
	currentIcon?: ReactNode;
	isLeafletOpen?: boolean;
	onExitMap?: () => void;
}

export function MapsBreadcrumb({ currentPage, currentIcon, isLeafletOpen = false, onExitMap }: MapsBreadcrumbProps) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
						<HouseIcon className="size-3.5" />
						Beranda
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<CaretDoubleRightIcon />
				</BreadcrumbSeparator>
				
				{!isLeafletOpen ? (
					<BreadcrumbItem>
						<BreadcrumbPage className="flex items-center gap-1">
							{currentIcon}
							{currentPage}
						</BreadcrumbPage>
					</BreadcrumbItem>
				) : (
					<>
						<BreadcrumbItem>
							{onExitMap ? (
								<BreadcrumbLink
									render={<button type="button" onClick={onExitMap} />}
									className="flex items-center gap-1"
								>
									{currentIcon}
									{currentPage}
								</BreadcrumbLink>
							) : (
								<BreadcrumbLink
									href={
										currentPage === "Peta Kemiskinan" || currentPage === "Poverty" ? "/dashboard/poverty" :
										currentPage === "Lahan dan Jalan" || currentPage === "Lands and Roads" ? "/dashboard/land" :
										currentPage === "SPBU dan Charger" || currentPage === "Gas Stations" ? "/dashboard/gas-station" :
										"/dashboard"
									}
									className="flex items-center gap-1"
								>
									{currentIcon}
									{currentPage}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						<BreadcrumbSeparator>
							<CaretDoubleRightIcon />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbPage className="flex items-center gap-1">
								<GlobeHemisphereWestIcon className="size-3.5" />
								Peta
							</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
