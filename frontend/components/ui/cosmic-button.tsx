"use client"

import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

/**
 * Requires these keyframes and utilities in your CSS (e.g. global CSS or Tailwind):
 *
 * @keyframes cosmic-spin {
 *   from { transform: rotate(0deg); }
 *   to { transform: rotate(360deg); }
 * }
 * @keyframes cosmic-spin-slow {
 *   from { transform: rotate(0deg); }
 *   to { transform: rotate(-360deg); }
 * }
 * @utility animate-cosmic-spin {
 *   animation: cosmic-spin 3s linear infinite;
 * }
 * @utility animate-cosmic-spin-slow {
 *   animation: cosmic-spin-slow 5s linear infinite;
 * }
 */

export type CosmicButtonProps<E extends "a" | "button" = "a"> = {
  /** The HTML element to render as. @default "a" */
  as?: E
  size?: "sm" | "md"
} & ComponentPropsWithoutRef<E>

/**
 * An animated button/link with a cosmic gradient border effect.
 * Renders as an anchor by default; use `as="button"` for button behavior.
 *
 * @example
 * // As link (default)
 * <CosmicButton href="/about">About</CosmicButton>
 *
 * @example
 * // As button
 * <CosmicButton as="button" onClick={handleClick}>Submit</CosmicButton>
 */
export function CosmicButton<E extends "a" | "button" = "a">({
  as,
  size = "md",
  className,
  children,
  ...props
}: CosmicButtonProps<E>) {
  const Element = as ?? "a"
  const isAnchor = Element === "a"
  const isSm = size === "sm"

  const baseClassName = cn(
    "group/cosmic relative inline-flex items-center justify-center rounded-full p-[2px] transition-transform  ",
    isSm ? "min-h-8 min-w-8" : "min-h-11 min-w-11",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b1f] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  )

  const content = (
    <>
      {/* Animated cosmic border - enlarges on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-full transition-all duration-300 ease-out group-hover/cosmic:inset-[-2px] group-hover/cosmic:rounded-full">
        <span className="absolute inset-[-200%] animate-cosmic-spin bg-[conic-gradient(from_0deg,#ff3b1f,#5683d2,#ffffff,#5683d2,#ff3b1f)] opacity-95" />
      </span>

      {/* Noise/texture overlay on the border - enlarges on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-full opacity-45 mix-blend-soft-light transition-all duration-300 ease-out group-hover/cosmic:inset-[-2px] group-hover/cosmic:rounded-full dark:opacity-60 dark:mix-blend-overlay">
        <span className="absolute inset-[-200%] animate-cosmic-spin-slow bg-[conic-gradient(from_180deg,#ffffff_0%,transparent_30%,#ff3b1f_50%,transparent_70%,#5683d2_100%)]" />
      </span>

      {/* Theme-aware inner background */}
      <span className={cn(
        "relative z-10 flex items-center rounded-full bg-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.08),0_1px_1px_rgba(15,23,42,0.08),0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-300 group-hover/cosmic:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(15,23,42,0.12),0_2px_6px_rgba(15,23,42,0.14),0_12px_34px_rgba(15,23,42,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.45),0_10px_28px_rgba(0,0,0,0.35)] dark:group-hover/cosmic:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.55),0_14px_34px_rgba(0,0,0,0.42)] active:scale-[0.98]",
        isSm ? "px-3.5 py-1.5 gap-1.5" : "px-5 py-2.5 gap-3"
      )}>
        <span className={cn(
          "font-medium tracking-wide text-foreground",
          isSm ? "text-xs" : "text-base"
        )}>
          {children ?? "Placeholder text"}
        </span>
      </span>
    </>
  )

  if (isAnchor) {
    const { href, rel, target, ...rest } =
      props as ComponentPropsWithoutRef<"a">
    return (
      <a
        className={baseClassName}
        href={href ?? "https://aisdkagents.com"}
        rel={rel ?? "noopener noreferrer"}
        target={target ?? "_blank"}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      className={baseClassName}
      {...(props as ComponentPropsWithoutRef<"button">)}
    >
      {content}
    </button>
  )
}
