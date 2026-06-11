"use client";

import { useState, type FC } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
} from "framer-motion";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// 1. PhosphorIcon mask component
export interface PhosphorIconProps {
  name: string;
  className?: string;
}

export const PhosphorIcon = ({ name, className }: PhosphorIconProps) => {
  const fileName = name.endsWith("-light") ? name : `${name}-light`;
  return (
    <span
      className={cn("inline-block bg-current shrink-0", className)}
      style={{
        maskImage: `url(/light/${fileName}.svg)`,
        WebkitMaskImage: `url(/light/${fileName}.svg)`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export interface CollectionItem {
  id: string;
  name: string;
  price?: number;
  unit?: string; // e.g. "jiwa", "KK" — shown after the value instead of a "$" prefix
  icon: string; // Phosphor icon name
  isActive?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
}

interface DisclosureCardProps {
  collections: Collection[];
  compact?: boolean;
  onItemClick?: (itemId: string, collectionId: string) => void;
  dragDropEnabled?: boolean;
}

const springConfig: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 1.1,
};

export const DisclosureCard: FC<DisclosureCardProps> = ({
  collections,
  compact = false,
  onItemClick,
  dragDropEnabled = false,
}) => {
  return (
    <div className={cn("flex w-full items-center justify-center", compact && "w-auto")}>
      <motion.div
        className="flex flex-col gap-2 will-change-transform"
        layout="position"
        transition={springConfig}
      >
        {collections.map((collection) => (
          <GridContainer
            key={collection.id}
            title={collection.name}
            items={collection.items}
            compact={compact}
            collectionId={collection.id}
            onItemClick={onItemClick}
            dragDropEnabled={dragDropEnabled}
          />
        ))}
      </motion.div>
    </div>
  );
};

// Draggable wrapper for each expanded item
const DraggableItem = ({
  item,
  collectionId,
  compact,
  onItemClick,
  dragDropEnabled = false,
}: {
  item: CollectionItem;
  collectionId: string;
  compact: boolean;
  onItemClick?: (itemId: string, collectionId: string) => void;
  dragDropEnabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${collectionId}::${item.id}`,
    data: { itemId: item.id, collectionId },
    disabled: !dragDropEnabled || collectionId === "maps-settings" || collectionId === "demographics",
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 9999 : undefined, opacity: isDragging ? 0.8 : undefined }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-md p-1 transition-colors touch-none",
        onItemClick ? "cursor-grab active:cursor-grabbing hover:bg-zinc-200/30 dark:hover:bg-zinc-700/30" : ""
      )}
      onClick={() => {
        if (isDragging) return;
        if (onItemClick) onItemClick(item.id, collectionId);
      }}
    >
      {item.isActive && (
        <motion.div
          layoutId={`active-highlight-${collectionId}`}
          className="absolute inset-0 bg-transparent rounded-md border border-primary/30 pointer-events-none"
          initial={false}
          transition={springConfig}
        />
      )}
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-full z-10 transition-colors",
          compact ? "size-7" : "size-10",
          item.isActive ? "bg-transparent text-primary" : "bg-transparent text-zinc-700 dark:text-zinc-300"
        )}
        layoutId={`${item.name}`}
      >
        <PhosphorIcon name={item.icon} className={cn("text-current", compact ? "size-3.5" : "size-5")} />
      </motion.div>
      <motion.div
        className="flex flex-1 flex-col items-start justify-center gap-0.5 leading-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.p className={cn("text-zinc-800 dark:text-zinc-100 font-medium", compact ? "text-[11px]" : "text-md")}>
          {item.name}
        </motion.p>
        {item.price !== undefined && item.price > 0 && (
          <div className="flex gap-1 text-zinc-400 dark:text-zinc-500">
            <p className={compact ? "text-[9px]" : "text-sm"}>
              {item.unit ? `${item.price.toLocaleString("id-ID")} ${item.unit}` : `$${item.price}`}
            </p>
          </div>
        )}
      </motion.div>
      <div className="z-10 flex items-center justify-center">
        {item.isActive ? (
          <PhosphorIcon name="check" className={cn("text-primary font-bold", compact ? "size-3.5" : "size-5")} />
        ) : (
          <PhosphorIcon name="caret-right" className={cn("text-zinc-400 dark:text-zinc-500", compact ? "size-3.5" : "size-5")} />
        )}
      </div>
    </div>
  );
};

const GridContainer = ({
  items,
  title,
  compact = false,
  collectionId,
  onItemClick,
  dragDropEnabled = false,
}: {
  items: CollectionItem[];
  title: string;
  compact?: boolean;
  collectionId: string;
  onItemClick?: (itemId: string, collectionId: string) => void;
  dragDropEnabled?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ref, bounds] = useMeasure({ offsetSize: true });

  const cardWidth = compact ? "w-[220px]" : "w-[300px]";
  const cardBg = compact
    ? "border-border/60 bg-background/95 backdrop-blur-md shadow-md"
    : "border-gray-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800";
  const titleSize = compact ? "text-xs font-semibold text-foreground" : "text-lg text-zinc-900 dark:text-zinc-100";
  const subtitleSize = compact ? "text-[10px] text-muted-foreground" : "text-sm text-zinc-500 dark:text-zinc-400";
  const circleSize = compact ? "size-5" : "size-6";
  const circleIconSize = compact ? "size-3" : "size-4";
  const chevronSize = compact ? "size-3.5" : "size-6";

  return (
    <MotionConfig transition={springConfig}>
      <motion.div
        className={cn("cursor-pointer overflow-hidden rounded-lg border", cardWidth, cardBg)}
        animate={{
          height: bounds.height > 0 ? bounds.height : "auto",
        }}
      >
        <div className="p-2" ref={ref}>
          <AnimatePresence
            mode="popLayout"
            key={isExpanded ? "expanded" : "collapsed"}
            propagate
          >
            {!isExpanded ? (
              <motion.div
                key={"collapsed"}
                className="flex w-full items-center space-x-2"
                onClick={() => setIsExpanded(true)}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <div className="grid grid-cols-2 gap-1">
                  {items.slice(0, 4).map((item, index) => (
                    <motion.div
                      className={cn(
                        "relative flex items-center justify-center rounded-full bg-zinc-300 p-1 dark:bg-zinc-700",
                        circleSize
                      )}
                      key={`${item.name}-${index}`}
                      layoutId={`${item.name}`}
                      transition={{ ...springConfig, delay: 0.01 }}
                    >
                      <PhosphorIcon name={item.icon} className={cn("text-zinc-700 dark:text-zinc-200", circleIconSize)} />
                    </motion.div>
                  ))}
                </div>

                <div className="ml-2 flex flex-1 flex-col items-start justify-center">
                  <motion.span
                    layoutId={`title-${title}`}
                    layout="position"
                    className={titleSize}
                  >
                    {title}
                  </motion.span>
                  <span className={subtitleSize}>
                    {items.length} Item
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <PhosphorIcon name="caret-right" className={cn("text-zinc-500 dark:text-zinc-400", chevronSize)} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={"expanded"}
                className="flex w-full flex-col gap-3"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.01, ease: "easeOut" }}
              >
                <motion.div className="flex items-center px-1" layout>
                  <motion.span
                    className={cn("flex-1", titleSize)}
                    layoutId={`title-${title}`}
                    layout="position"
                  >
                    {title}
                  </motion.span>
                  <div
                    className="flex items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700 p-1 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                  >
                    <PhosphorIcon name="x" className={cn("text-zinc-700 dark:text-zinc-200", compact ? "size-3" : "size-4")} />
                  </div>
                </motion.div>

                <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-3")}>
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <DraggableItem
                        key={item.id}
                        item={item}
                        collectionId={collectionId}
                        compact={compact}
                        onItemClick={onItemClick}
                        dragDropEnabled={dragDropEnabled}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
};

// 2. Specialized Poverty Disclosure Card
interface DashboardDisclosureCardProps {
  mapStyle: "street" | "satellite";
  onMapStyleChange: (style: "street" | "satellite") => void;
  onToolSelect: (toolId: string | null) => void;
  activeTool: string | null;
  compact?: boolean;
  dragDropEnabled: boolean;
  onDragDropToggle: (enabled: boolean) => void;
}

export interface PovertyDemographics {
  population: number;     // total jiwa across all registered households
  beneficiaries: number;  // households (KK) classified Extreme/Miskin
  socialSecurity: number; // households (KK) classified Rentan
}

interface PovertyDisclosureCardProps extends DashboardDisclosureCardProps {
  demographics?: PovertyDemographics;
}

export const PovertyDisclosureCard: FC<PovertyDisclosureCardProps> = ({
  mapStyle,
  onMapStyleChange,
  onToolSelect,
  activeTool,
  compact = true,
  demographics,
  dragDropEnabled,
  onDragDropToggle,
}) => {
  const collections: Collection[] = [
    {
      id: "maps-settings",
      name: "Pengaturan Peta",
      items: [
        { id: "street", name: "Tampilan Jalan", icon: "map-trifold", isActive: mapStyle === "street" },
        { id: "satellite", name: "Tampilan Satelit", icon: "globe", isActive: mapStyle === "satellite" },
        { id: "drag-drop", name: "Seret & Lepas", icon: "hand-grabbing", isActive: dragDropEnabled },
      ],
    },
    {
      id: "poverty-tools",
      name: "Alat Peta Kemiskinan",
      items: [
        { id: "marker", name: "Tambah Data Warga", icon: "map-pin", isActive: activeTool === "marker" },
        { id: "religion", name: "Tambah Rumah Ibadah", icon: "church", isActive: activeTool === "religion" },
        { id: "clinic", name: "Tambah Klinik", icon: "first-aid", isActive: activeTool === "clinic" },
        { id: "food-bank", name: "Tambah Lumbung Pangan", icon: "bowl-food", isActive: activeTool === "food-bank" },
        { id: "school", name: "Tambah Sekolah", icon: "graduation-cap", isActive: activeTool === "school" },
      ],
    },
    {
      id: "demographics",
      name: "Demografi",
      items: [
        { id: "dm-1", name: "Total Warga Terdata", price: demographics?.population ?? 0, unit: "jiwa", icon: "users" },
        { id: "dm-2", name: "KK Miskin & Ekstrem", price: demographics?.beneficiaries ?? 0, unit: "KK", icon: "hand-heart" },
        { id: "dm-3", name: "KK Rentan", price: demographics?.socialSecurity ?? 0, unit: "KK", icon: "shield-check" },
      ],
    },
  ];

  return (
    <DisclosureCard
      collections={collections}
      compact={compact}
      onItemClick={(itemId, collectionId) => {
        if (collectionId === "maps-settings") {
          if (itemId === "drag-drop") {
            onDragDropToggle(!dragDropEnabled);
          } else {
            onMapStyleChange(itemId as "street" | "satellite");
          }
        } else if (collectionId === "poverty-tools") {
          onToolSelect(activeTool === itemId ? null : itemId);
        }
      }}
      dragDropEnabled={dragDropEnabled}
    />
  );
};

// 3. Specialized Land Disclosure Card
export const LandDisclosureCard: FC<DashboardDisclosureCardProps> = ({
  mapStyle,
  onMapStyleChange,
  onToolSelect,
  activeTool,
  compact = true,
  dragDropEnabled,
  onDragDropToggle,
}) => {
  const collections: Collection[] = [
    {
      id: "maps-settings",
      name: "Pengaturan Peta",
      items: [
        { id: "street", name: "Tampilan Jalan", icon: "map-trifold", isActive: mapStyle === "street" },
        { id: "satellite", name: "Tampilan Satelit", icon: "globe", isActive: mapStyle === "satellite" },
        { id: "drag-drop", name: "Seret & Lepas", icon: "hand-grabbing", isActive: dragDropEnabled },
      ],
    },
    {
      id: "land-tools",
      name: "Alat Peta Lahan",
      items: [
        { id: "marker", name: "Tambah Penanda", icon: "map-pin", isActive: activeTool === "marker" },
        { id: "flag", name: "Tambah Tengara", icon: "flag", isActive: activeTool === "flag" },
        { id: "protected", name: "Tambah Kawasan Lindung", icon: "tree", isActive: activeTool === "protected" },
        { id: "registry", name: "Tambah Kantor Pendaftaran", icon: "bank", isActive: activeTool === "registry" },
        { id: "line", name: "Gambar Garis", icon: "bezier-curve", isActive: activeTool === "line" },
        { id: "polygon", name: "Gambar Poligon", icon: "hexagon", isActive: activeTool === "polygon" },
        { id: "circle", name: "Gambar Lingkaran", icon: "circle", isActive: activeTool === "circle" },
      ],
    },
    {
      id: "land-permits",
      name: "Izin Lahan",
      items: [
        { id: "lp-1", name: "Izin Mendirikan Bangunan (IMB)", price: 342, icon: "building" },
        { id: "lp-2", name: "Sertifikat Tanah", price: 1580, icon: "certificate" },
        { id: "lp-3", name: "Banding Zonasi", price: 47, icon: "gavel" },
      ],
    },
    {
      id: "environmental",
      name: "Lingkungan",
      items: [
        { id: "ev-1", name: "Tutupan Hijau", price: 67.8, icon: "leaf" },
        { id: "ev-2", name: "Aliran Air", price: 23.4, icon: "drop" },
        { id: "ev-3", name: "Jaringan Jalan", price: 1420, icon: "road-horizon" },
      ],
    },
  ];

  return (
    <DisclosureCard
      collections={collections}
      compact={compact}
      onItemClick={(itemId, collectionId) => {
        if (collectionId === "maps-settings") {
          if (itemId === "drag-drop") {
            onDragDropToggle(!dragDropEnabled);
          } else {
            onMapStyleChange(itemId as "street" | "satellite");
          }
        } else if (collectionId === "land-tools") {
          onToolSelect(activeTool === itemId ? null : itemId);
        }
      }}
      dragDropEnabled={dragDropEnabled}
    />
  );
};

// 4. Specialized Gas Station Disclosure Card
export const GasStationDisclosureCard: FC<DashboardDisclosureCardProps> = ({
  mapStyle,
  onMapStyleChange,
  onToolSelect,
  activeTool,
  compact = true,
  dragDropEnabled,
  onDragDropToggle,
}) => {
  const collections: Collection[] = [
    {
      id: "maps-settings",
      name: "Pengaturan Peta",
      items: [
        { id: "street", name: "Tampilan Jalan", icon: "map-trifold", isActive: mapStyle === "street" },
        { id: "satellite", name: "Tampilan Satelit", icon: "globe", isActive: mapStyle === "satellite" },
        { id: "drag-drop", name: "Seret & Lepas", icon: "hand-grabbing", isActive: dragDropEnabled },
      ],
    },
    {
      id: "station-tools",
      name: "Alat Peta Stasiun",
      items: [
        { id: "charging-station", name: "Tambah Pengisi Daya EV", icon: "charging-station", isActive: activeTool === "charging-station" },
        { id: "gas-pump", name: "Tambah SPBU", icon: "gas-pump", isActive: activeTool === "gas-pump" },
        { id: "wrench", name: "Tambah Bengkel", icon: "wrench", isActive: activeTool === "wrench" },
      ],
    },
    {
      id: "station-services",
      name: "Layanan Stasiun",
      items: [
        { id: "ss-1", name: "Toko Kelontong", price: 450, icon: "shopping-bag" },
        { id: "ss-2", name: "Pencucian Mobil", price: 75, icon: "bathtub" },
        { id: "ss-3", name: "Mekanik", price: 320, icon: "wrench" },
        { id: "ss-4", name: "Tukar Baterai", price: 180, icon: "car-battery" },
      ],
    },
    {
      id: "fleet-logistics",
      name: "Armada & Logistik",
      items: [
        { id: "fl-1", name: "Kartu Armada", price: 1240, icon: "credit-card" },
        { id: "fl-2", name: "Rencana Rute", price: 89, icon: "paper-plane" },
        { id: "fl-3", name: "Laporan Bahan Bakar", price: 56, icon: "file-text" },
      ],
    },
  ];

  return (
    <DisclosureCard
      collections={collections}
      compact={compact}
      onItemClick={(itemId, collectionId) => {
        if (collectionId === "maps-settings") {
          if (itemId === "drag-drop") {
            onDragDropToggle(!dragDropEnabled);
          } else {
            onMapStyleChange(itemId as "street" | "satellite");
          }
        } else if (collectionId === "station-tools") {
          onToolSelect(activeTool === itemId ? null : itemId);
        }
      }}
      dragDropEnabled={dragDropEnabled}
    />
  );
};
