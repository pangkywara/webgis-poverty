import type React from "react";

/**
 * LogoIcon: A clean, modern geometric mark representing "Waras"
 * Uses abstract overlapping pill/capsule shapes to form a stylized 'W'.
 */
export const LogoIcon = (props: React.ComponentProps<"svg">) => (
    <svg 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        width="24"
        height="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M3 3h4l3 13 3-13h4l3 13 3-13h4l-4 18h-4l-3-13-3 13H7L3 3z" />
    </svg>
);

/**
 * Logo: The full "Waras" brand mark
 * Combines the geometric icon with clean, high-impact typography.
 */
export const Logo = (props: React.ComponentProps<"svg">) => (
    <svg
        fill="currentColor"
        viewBox="0 0 140 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Stylized 'W' Icon Element */}
        <g transform="translate(0, 0)">
            <path d="M2 4h3.5l2.5 11 2.5-11H14l2.5 11 2.5-11H22l-3.5 16h-3.5L12.5 9 10 20H6.5L2 4z" />
        </g>
        
        {/* Typography for "aras" */}
        <text
            x="28"
            y="18"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="18"
            letterSpacing="0.05em"
        >
            aras
        </text>
    </svg>
);