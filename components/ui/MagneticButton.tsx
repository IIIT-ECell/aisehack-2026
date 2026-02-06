"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "outline";
    size?: "md" | "lg";
    magnetStrength?: number;
}

export function MagneticButton({
    children,
    className,
    variant = "primary",
    size = "md",
    magnetStrength = 0.3,
    ...props
}: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * magnetStrength;
        const deltaY = (e.clientY - centerY) * magnetStrength;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
        setIsHovering(false);
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    return (
        <motion.button
            ref={buttonRef}
            className={cn(
                "relative inline-flex items-center justify-center font-medium transition-all duration-300 overflow-hidden group",
                {
                    "bg-primary text-black rounded-full": variant === "primary",
                    "bg-transparent border border-white/30 text-white rounded-full backdrop-blur-sm": variant === "outline",
                    "h-11 px-8 text-base": size === "md",
                    "h-14 px-10 text-lg": size === "lg",
                },
                className
            )}
            animate={{
                x: position.x,
                y: position.y,
                scale: isHovering ? 1.05 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 350,
                damping: 15,
                mass: 0.5,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {/* Glow effect */}
            <span
                className={cn(
                    "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
                    variant === "primary" && "bg-primary shadow-[0_0_30px_10px_rgba(0,255,157,0.4)]",
                    variant === "outline" && "shadow-[0_0_20px_5px_rgba(255,255,255,0.2)]",
                    isHovering && "opacity-100"
                )}
            />

            {/* Ripple effect container */}
            <span className="absolute inset-0 overflow-hidden rounded-full">
                <span
                    className={cn(
                        "absolute inset-0 translate-y-full transition-transform duration-500 ease-out",
                        variant === "primary" && "bg-white/20",
                        variant === "outline" && "bg-white/10",
                        isHovering && "translate-y-0"
                    )}
                />
            </span>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    );
}
