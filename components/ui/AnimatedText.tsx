"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
    text: string;
    className?: string;
    delay?: number;
    staggerDelay?: number;
    shimmer?: boolean;
}

export function AnimatedText({
    text,
    className,
    delay = 0,
    staggerDelay = 0.03,
    shimmer = false
}: AnimatedTextProps) {
    const characters = text.split("");

    return (
        <span className={cn("inline-flex overflow-hidden", className)}>
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: delay + i * staggerDelay,
                        ease: [0.215, 0.61, 0.355, 1],
                    }}
                    className={cn(
                        "inline-block",
                        shimmer && "animate-shimmer bg-gradient-to-r from-white via-primary to-white bg-[length:200%_100%] bg-clip-text text-transparent"
                    )}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );
}

interface GlitchTextProps {
    text: string;
    className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
    return (
        <span className={cn("relative inline-block", className)}>
            <span className="relative z-10">{text}</span>
            <span
                className="absolute inset-0 text-primary opacity-80 animate-glitch-1"
                aria-hidden="true"
            >
                {text}
            </span>
            <span
                className="absolute inset-0 text-secondary opacity-80 animate-glitch-2"
                aria-hidden="true"
            >
                {text}
            </span>
        </span>
    );
}

interface RevealTextProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function RevealText({ children, className, delay = 0 }: RevealTextProps) {
    return (
        <div className={cn("overflow-hidden", className)}>
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                    duration: 0.8,
                    delay,
                    ease: [0.215, 0.61, 0.355, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
