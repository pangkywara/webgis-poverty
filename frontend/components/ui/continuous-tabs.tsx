"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, type FC, useId } from "react";
import { motion, LayoutGroup } from "framer-motion";

/* ---------- Types ---------- */
interface TabItem {
    id: string;
    label: string;
}

interface ContinuousTabsProps {
    tabs?: TabItem[];
    activeId?: string;
    defaultActiveId?: string;
    onChange?: (id: string) => void;
    size?: "sm" | "md";
    layoutId?: string;
}

/* ---------- Defaults ---------- */
const DEFAULT_TABS: TabItem[] = [
    { id: "home", label: "Home" },
    { id: "interactions", label: "Interactions" },
    { id: "resources", label: "Resources" },
    { id: "docs", label: "Docs" },
];

export const ContinuousTabs: FC<ContinuousTabsProps> = ({
    tabs = DEFAULT_TABS,
    activeId,
    defaultActiveId = "home",
    onChange,
    size = "md",
    layoutId,
}) => {
    const [activeState, setActiveState] = useState<string>(defaultActiveId);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const uniqueId = useId();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const active = activeId !== undefined ? activeId : activeState;
    const finalLayoutId = layoutId ?? `active-pill-${uniqueId}`;

    const handleChange = (id: string) => {
        setActiveState(id);
        onChange?.(id);
    };

    if (!isMounted) return null;

    const isSm = size === "sm";

    return (
        <LayoutGroup>
            <nav
                className={`
                    relative flex items-center bg-muted/40 dark:bg-charcoal/50
                    border border-border
                    rounded-full transition-all duration-300
                    shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05)]
                    ${isSm ? "gap-0.5 p-1" : "gap-0.5 sm:gap-1 p-1.5 sm:p-2"}
                `}
            >
                {tabs.map((tab) => {
                    const isActive = active === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleChange(tab.id)}
                            className={`
                                relative flex items-center justify-center rounded-full outline-none transition-transform active:scale-[0.98]
                                ${isSm ? "px-3 py-1.5" : "px-5 py-2 sm:px-6 sm:py-2.5"}
                            `}
                        >
                            {/* Active pill */}
                            {isActive && (
                                <motion.div
                                    layoutId={finalLayoutId}
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                        mass: 0.9,
                                    }}
                                    className="
                                        absolute inset-0 rounded-full
                                        bg-[#ff3b1f]
                                        shadow-sm
                                    "
                                />
                            )}

                            {/* Text */}
                            <motion.span
                                layout="position"
                                className={`
                                    relative z-10 font-semibold leading-none transition-colors duration-200
                                    ${isSm ? "text-[11px] sm:text-xs" : "text-sm sm:text-base"}
                                    ${isActive
                                        ? "text-white"
                                        : "text-muted-foreground hover:text-foreground"
                                    }
                                `}
                            >
                                {tab.label}
                            </motion.span>
                        </button>
                    );
                })}
            </nav>
        </LayoutGroup>
    );
};