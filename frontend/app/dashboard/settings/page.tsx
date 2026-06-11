"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/auth-types";
import {
	UserIcon,
	AtSignIcon,
	KeyRoundIcon,
	SettingsIcon
} from "@/components/ui/phosphor-icons";

const ROLE_DETAILS = [
	{
		value: "superadmin" as Role,
		label: "Super Administrator",
		description: "Akses penuh ke semua peta (Kemiskinan, Lahan & Jalan, SPBU) serta statistik analitik.",
	},
	{
		value: "admin_poverty" as Role,
		label: "Admin Poverty Map",
		description: "Akses terbatas khusus untuk peta kemiskinan dan analisis data warga miskin.",
	},
	{
		value: "admin_lands_roads" as Role,
		label: "Admin Lahan & Jalan",
		description: "Akses terbatas khusus untuk manajemen lahan tata ruang dan jalan transportasi.",
	},
	{
		value: "admin_gas_stations" as Role,
		label: "Admin SPBU",
		description: "Akses terbatas khusus untuk pemetaan SPBU, EV Charger, dan Bengkel.",
	}
];

export default function SettingsPage() {
	const { user, token, login } = useAuth();
	
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [selectedRole, setSelectedRole] = useState<Role>("superadmin");
	const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
	const [saving, setSaving] = useState(false);

	// Load user details when loaded
	useEffect(() => {
		if (user) {
			setName(user.username || "");
			setEmail(user.email || "");
			setSelectedRole(user.role || "superadmin");
			
			// Load map preference from localStorage if set
			const savedMapStyle = localStorage.getItem("default_map_style") as "street" | "satellite";
			if (savedMapStyle) {
				setMapStyle(savedMapStyle);
			}
		}
	}, [user]);

	function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (!user || !token) return;

		setSaving(true);
		
		setTimeout(() => {
			const updatedUser = {
				...user,
				username: name.trim(),
				email: email.trim(),
				role: selectedRole
			};

			// Save profile and role to AuthContext
			login(token, updatedUser);

			// Save map preferences to localStorage
			localStorage.setItem("default_map_style", mapStyle);

			toast.success("Pengaturan berhasil disimpan!");
			setSaving(false);
		}, 800);
	}

	return (
		<AppShell activePath="/dashboard/settings">
			<div className="max-w-4xl mx-auto flex flex-col gap-8 py-6 px-4">
				{/* Page Header */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-md bg-primary/10 text-primary">
							<SettingsIcon className="h-5 w-5" />
						</div>
						<h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
							Pengaturan Akun
						</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Kelola informasi profil, peran administrator sistem, dan preferensi tampilan peta global.
					</p>
				</div>

				<form onSubmit={handleSave} className="flex flex-col gap-6">
					{/* Profile Card */}
					<div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
						<h2 className="text-base font-semibold text-foreground">Informasi Profil</h2>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<label className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
									<UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
									<span>Nama Pengguna</span>
								</label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Masukkan nama pengguna"
									required
									className="bg-background border border-border focus-visible:border-ring rounded-md h-10 text-sm"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
									<AtSignIcon className="h-3.5 w-3.5 text-muted-foreground" />
									<span>Email</span>
								</label>
								<Input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Masukkan email"
									required
									className="bg-background border border-border focus-visible:border-ring rounded-md h-10 text-sm"
								/>
							</div>
						</div>
					</div>

					{/* Role Gating Card */}
					<div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
						<div className="flex flex-col gap-1">
							<h2 className="text-base font-semibold text-foreground flex items-center gap-1.5">
								<KeyRoundIcon className="h-4 w-4 text-muted-foreground" />
								<span>Peran &amp; Hak Akses</span>
							</h2>
							<p className="text-[11.5px] text-muted-foreground leading-normal">
								Pilih peran admin untuk membatasi atau membuka modul visualisasi peta di sidebar.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{ROLE_DETAILS.map((roleOpt) => {
								const isSelected = selectedRole === roleOpt.value;
								return (
									<div
										key={roleOpt.value}
										onClick={() => setSelectedRole(roleOpt.value)}
										className={`p-4 border rounded-xl cursor-pointer flex flex-col gap-2 transition-all select-none ${
											isSelected
												? "border-primary bg-primary/5 shadow-sm"
												: "border-border/60 bg-background hover:bg-muted/50"
										}`}
									>
										<div className="flex items-center justify-between">
											<span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
												{roleOpt.label}
											</span>
											{isSelected && (
												<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
											)}
										</div>
										<p className="text-[10px] text-muted-foreground leading-relaxed">
											{roleOpt.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					{/* Map Preferences Card */}
					<div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
						<h2 className="text-base font-semibold text-foreground">Preferensi Peta</h2>
						
						<div className="flex flex-col gap-2">
							<span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
								Default Map Style
							</span>
							<div className="flex gap-2">
								{["street", "satellite"].map((style) => {
									const isSelected = mapStyle === style;
									return (
										<button
											key={style}
											type="button"
											onClick={() => setMapStyle(style as any)}
											className={`h-9 px-4 rounded-md border text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
												isSelected
													? "bg-primary border-transparent text-primary-foreground shadow-sm"
													: "bg-background border-border text-foreground/75 hover:bg-muted"
											}`}
										>
											{style === "street" ? "Street View" : "Satellite View"}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Submit Action */}
					<div className="flex justify-end gap-2 border-t pt-4">
						<button
							type="submit"
							disabled={saving || !name.trim() || !email.trim()}
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-6 py-2.5 h-10 text-xs uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
						>
							{saving ? "Menyimpan..." : "Simpan Perubahan"}
						</button>
					</div>
				</form>
			</div>
		</AppShell>
	);
}
