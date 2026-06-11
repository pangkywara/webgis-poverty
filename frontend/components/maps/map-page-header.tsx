import { CosmicButton } from "@/components/ui/cosmic-button";
import { MapIcon } from "@/components/ui/phosphor-icons";

interface MapPageHeaderProps {
	title: string;
	description: string;
	onOpenMap: () => void;
	buttonText: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
}

export function MapPageHeader({ title, description, onOpenMap, buttonText, icon, children }: MapPageHeaderProps) {
	return (
		<div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<div className="flex items-center gap-3">
				<CosmicButton
					as="button"
					size="sm"
					onClick={onOpenMap}
				>
					<span className="flex items-center gap-1.5">
						{icon ?? <MapIcon className="h-4 w-4" />}
						<span className="capitalize">{buttonText}</span>
					</span>
				</CosmicButton>
				{children}
			</div>
		</div>
	);
}
