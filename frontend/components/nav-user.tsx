"use client";

import {
	Avatar,
	AvatarFallback,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsIcon, LogOutIcon } from "@/components/ui/phosphor-icons";
import { useAuth } from "@/lib/auth-context";

export function NavUser() {
	const { user, logout } = useAuth();

	const displayName = user?.username ?? "User";
	const displayEmail = user?.email ?? "";
	const initials = displayName.charAt(0).toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger nativeButton={false} render={<Avatar className="size-8" />}>
				<AvatarFallback>{initials}</AvatarFallback>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuItem className="flex items-center justify-start gap-2">
					<div className="flex items-center gap-3">
						<Avatar className="size-10">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground">{displayName}</span>
							<br />
							<div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{displayEmail}
							</div>
						</div>
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<SettingsIcon />
						Pengaturan
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="w-full cursor-pointer"
						variant="destructive"
						onClick={logout}
					>
						<LogOutIcon />
						Keluar
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
