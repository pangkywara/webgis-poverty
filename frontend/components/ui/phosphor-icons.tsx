"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export function MapIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="96" y1="184" x2="96" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="160" y1="72" x2="160" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polygon points="96 184 32 200 32 56 96 40 160 72 224 56 224 200 160 216 96 184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function LayersIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="32 176 128 232 224 176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="32 128 128 184 224 128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polygon points="32 80 128 136 224 80 128 24 32 80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function FuelIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M56,216V56A16,16,0,0,1,72,40h80a16,16,0,0,1,16,16V216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="32" y1="216" x2="192" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M168,112h24a16,16,0,0,1,16,16v40a16,16,0,0,0,16,16h0a16,16,0,0,0,16-16V86.63a16,16,0,0,0-4.69-11.32L216,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="136" y1="112" x2="88" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function BarChart3Icon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="48 208 48 136 96 136" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="224" y1="208" x2="32" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="96 208 96 88 152 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="152 208 152 40 208 40 208 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function BriefcaseIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="112" y1="112" x2="144" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><rect x="32" y="64" width="192" height="144" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M168,64V48a16,16,0,0,0-16-16H104A16,16,0,0,0,88,48V64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M224,118.31A191.09,191.09,0,0,1,128,144a191.14,191.14,0,0,1-96-25.68" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function UsersIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M10.23,200a88,88,0,0,1,147.54,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M172,160a87.93,87.93,0,0,1,73.77,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="84" cy="108" r="52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M152.69,59.7A52,52,0,1,1,172,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function PlugIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="144" y1="64" x2="184" y2="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="232" y1="72" x2="192" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="224" y1="144" x2="112" y2="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M212,132l-58.63,58.63a32,32,0,0,1-45.25,0L65.37,147.88a32,32,0,0,1,0-45.25L124,44" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="86.75" y1="169.25" x2="32" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function KeyRoundIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M93.17,122.83A71.68,71.68,0,0,1,88,95.91c0-38.58,31.08-70.64,69.64-71.87A72,72,0,0,1,232,98.36C230.73,136.92,198.67,168,160.09,168a71.68,71.68,0,0,1-26.92-5.17h0L120,176H96v24H72v24H40a8,8,0,0,1-8-8V187.31a8,8,0,0,1,2.34-5.65l58.83-58.83Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="180" cy="76" r="10"/>
		</svg>
	);
}

export function SettingsIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function CreditCardIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><rect x="24" y="56" width="208" height="144" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="168" y1="168" x2="200" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="120" y1="168" x2="136" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="24" y1="96" x2="232" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function HelpCircleIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="180" r="10"/><path d="M128,144v-8c17.67,0,32-12.54,32-28s-14.33-28-32-28S96,92.54,96,108v4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function BookOpenIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M128,88a32,32,0,0,1,32-32h72V200H160a32,32,0,0,0-32,32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M24,200H96a32,32,0,0,1,32,32V88A32,32,0,0,0,96,56H24Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function SendIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="108" y1="148" x2="160" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M223.69,42.18a8,8,0,0,0-9.87-9.87l-192,58.22a8,8,0,0,0-1.25,14.93L108,148l42.54,87.42a8,8,0,0,0,14.93-1.25Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function BellIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M96,192a32,32,0,0,0,64,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M56,104a72,72,0,0,1,144,0c0,35.82,8.3,64.6,14.9,76A8,8,0,0,1,208,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function SearchIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ArrowLeftIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="216" y1="128" x2="40" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="112 56 40 128 112 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function TrendingDownIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="232 192 136 96 96 136 24 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="232 128 232 192 168 192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function InfoIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="124" cy="84" r="10"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function EyeIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function EyeOffIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M154.91,157.6a40,40,0,0,1-53.82-59.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M135.53,88.71a40,40,0,0,1,32.3,35.53" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M208.61,169.1C230.41,149.58,240,128,240,128S208,56,128,56a126,126,0,0,0-20.68,1.68" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M74,68.6C33.23,89.24,16,128,16,128s32,72,112,72a118.05,118.05,0,0,0,54-12.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ShieldAlertIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="128" y1="136" x2="128" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="128" cy="172" r="10"/><path d="M216,112V56a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8v56c0,96,88,120,88,120S216,208,216,112Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function MapPinIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="104" r="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ZapIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polygon points="160 16 144 96 208 120 96 240 112 160 48 136 160 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ShoppingBagIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M168,88a40,40,0,0,1-80,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function CoffeeIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M83.3,216A88,88,0,0,1,32,136V88H208v48a88,88,0,0,1-51.3,80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="88" y1="24" x2="88" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="120" y1="24" x2="120" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="152" y1="24" x2="152" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="32" y1="216" x2="208" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M208,88h0a32,32,0,0,1,32,32v8a32,32,0,0,1-32,32h-3.38" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function SparklesIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M84.27,171.73l-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3a7.92,7.92,0,0,1,0,14.86l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="176" y1="16" x2="176" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="224" y1="72" x2="224" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="152" y1="40" x2="200" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="208" y1="88" x2="240" y2="88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ClockIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="128 72 128 128 184 128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function NavigationIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M152,152,234.35,129a8,8,0,0,0,.27-15.21l-176-65.28A8,8,0,0,0,48.46,58.63l65.28,176a8,8,0,0,0,15.21-.27Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function XIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="200" y1="56" x2="56" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="200" y1="200" x2="56" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="96 48 176 128 96 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="160 208 80 128 160 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function AtSignIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M184,208c-15.21,10.11-36.37,16-56,16a96,96,0,1,1,96-96c0,22.09-8,40-28,40s-28-17.91-28-40V88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function CircleCheckIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="88 136 112 160 168 104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ArrowRightIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function UserPlusIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="200" y1="136" x2="248" y2="136" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="224" y1="112" x2="224" y2="160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="108" cy="100" r="60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M24,200c20.55-24.45,49.56-40,84-40s63.45,15.55,84,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function FileTextIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="152 32 152 88 208 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="96" y1="136" x2="160" y2="136" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="96" y1="168" x2="160" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function RocketIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="144" y1="224" x2="112" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="128" cy="100" r="10"/><path d="M94.81,192C37.52,95.32,103.87,32.53,123.09,17.68a8,8,0,0,1,9.82,0C152.13,32.53,218.48,95.32,161.19,192Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M183.84,110.88l30.31,36.36a8,8,0,0,1,1.66,6.86l-12.36,55.63a8,8,0,0,1-12.81,4.51L161.19,192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M72.16,110.88,41.85,147.24a8,8,0,0,0-1.66,6.86l12.36,55.63a8,8,0,0,0,12.81,4.51L94.81,192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function MinusIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function TrendingUpIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="232 56 136 152 96 112 24 184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="232 120 232 56 168 56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ArrowUpIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="128" y1="216" x2="128" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="56 112 128 40 200 112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ChevronUpIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="48 160 128 80 208 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ArrowDownIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="128" y1="40" x2="128" y2="216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="56 144 128 216 200 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function ChevronDownIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="208 96 128 176 48 96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function MoreHorizontalIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="10"/><circle cx="60" cy="128" r="10"/><circle cx="196" cy="128" r="10"/>
		</svg>
	);
}

export function CheckIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="40 144 96 200 224 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function PanelLeftIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="88" y1="48" x2="88" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="32" y1="80" x2="56" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="32" y1="112" x2="56" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="32" y1="144" x2="56" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function UserIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function LogOutIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="112 40 48 40 48 216 112 216" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="112" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="184 88 224 128 184 168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function HandHeartIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M128,120a36,36,0,0,1,36-36c19.55,0,36,16.36,36,36v4a68,68,0,0,1-68,68H116" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M72,168H48a8,8,0,0,1-8-8V128a8,8,0,0,1,8-8H72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M72,168a32,32,0,0,0,32,32H176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M72,120v48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M148,84a20,20,0,0,0-20,20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M108.28,44.72a24,24,0,0,1,39.44,0L164,68H92Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function RoadHorizonIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><line x1="8" y1="200" x2="248" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="128" y1="120" x2="128" y2="136" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="128" y1="168" x2="128" y2="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="96" y1="72" x2="160" y2="72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="64" y1="200" x2="120" y2="72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><line x1="192" y1="200" x2="136" y2="72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function GlobeHemisphereWestIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M186.36,187.64l-26-9.33a8,8,0,0,1-5.23-5.63L150.24,153a8,8,0,0,1,1.68-7.27l22.77-26.67A8,8,0,0,1,180.8,116l18.83,2.68" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M89.55,43.35l5.31,17.72a8,8,0,0,1-2.87,8.56L71.33,84.94a8,8,0,0,0-2.69,8.84l7.36,22.09a8,8,0,0,1-2.71,8.79l-32,25.14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function WalletIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M40,56V184a16,16,0,0,0,16,16H216a8,8,0,0,0,8-8V80a8,8,0,0,0-8-8H56A16,16,0,0,1,40,56h0A16,16,0,0,1,56,40H192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><circle cx="180" cy="132" r="10"/>
		</svg>
	);
}

export function HouseIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><path d="M104,216V152h48v64h64V120a8,8,0,0,0-2.34-5.66l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,40,120v96Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}

export function CaretDoubleRightIcon({ className, ...props }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			className={cn("h-4 w-4 shrink-0 fill-none stroke-currentColor", className)}
			{...props}
		>
			<rect width="256" height="256" fill="none"/><polyline points="56 48 136 128 56 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><polyline points="136 48 216 128 136 208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
		</svg>
	);
}
