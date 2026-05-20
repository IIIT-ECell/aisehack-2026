"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Trophy, Archive } from "lucide-react";
import { useLenis } from "lenis/react";
import { REGISTRATION_URL } from "@/components/sections/v2/config";

const navItems = [
    { label: "About", href: "#about" },
    { label: "Timeline", href: "#timeline" },
    { label: "Themes", href: "#tracks" },
    { label: "Rules", href: "#rules" },
    { label: "FAQ", href: "#faq" },
];

const pastEditions = [
    {
        label: "Edition 1 · Climate & Sustainability",
        href: "/past-editions/edition-1",
        showcaseHref: "/past-editions/edition-1/showcase",
    },
];

export default function FloatingNav() {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pastOpen, setPastOpen] = useState(false);
    const pastRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsVisible(true);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const handleScroll = () => {
            setIsVisible(window.scrollY > 400);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobile]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!pastOpen) return;
        const onClick = (e: MouseEvent) => {
            if (pastRef.current && !pastRef.current.contains(e.target as Node)) {
                setPastOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [pastOpen]);

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                lenis?.scrollTo(element as HTMLElement);
            }
        }
        setIsOpen(false);
    };

    const registerHref = REGISTRATION_URL && REGISTRATION_URL !== "#" ? REGISTRATION_URL : "#";
    const registerEnabled = registerHref !== "#";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-4 z-[100] right-4 md:right-auto md:left-1/2 md:-translate-x-1/2"
                >
                    <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-2">
                        {/* Desktop nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.href}
                                    onClick={(e) => handleScrollToSection(e, item.href)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item.label}
                                </motion.a>
                            ))}

                            {/* Past Editions dropdown */}
                            <div ref={pastRef} className="relative">
                                <motion.button
                                    onClick={() => setPastOpen((v) => !v)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors duration-300 flex items-center gap-1"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Past Editions
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${pastOpen ? "rotate-180" : ""}`}
                                    />
                                </motion.button>

                                <AnimatePresence>
                                    {pastOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute right-0 mt-3 min-w-[320px] glass-strong rounded-2xl p-2 z-[101]"
                                        >
                                            {pastEditions.map((edition) => (
                                                <div key={edition.href} className="rounded-xl overflow-hidden">
                                                    <Link
                                                        href={edition.href}
                                                        onClick={() => setPastOpen(false)}
                                                        className="flex items-start gap-3 px-3 py-3 hover:bg-white/[0.06] transition-colors"
                                                    >
                                                        <Archive className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-white">
                                                                {edition.label}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5">
                                                                Hero, rules, schedule and FAQ — archived
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <Link
                                                        href={edition.showcaseHref}
                                                        onClick={() => setPastOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 ml-4 hover:bg-white/[0.06] transition-colors border-l border-white/10"
                                                    >
                                                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                                                        <span className="text-xs text-gray-300">
                                                            Winners &amp; Showcase
                                                        </span>
                                                    </Link>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* CTA Button */}
                        {registerEnabled ? (
                            <motion.a
                                href={registerHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:block px-6 py-2.5 bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium rounded-full border border-primary/20 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Register Now
                            </motion.a>
                        ) : (
                            <motion.span
                                className="hidden md:block px-6 py-2.5 bg-white/5 text-gray-400 text-sm font-medium rounded-full border border-white/10 cursor-not-allowed"
                                title="Registration link coming soon"
                            >
                                Registration · Soon
                            </motion.span>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-3 w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="md:hidden mt-2 glass-strong rounded-2xl p-4"
                            >
                                {navItems.map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.href}
                                        onClick={(e) => handleScrollToSection(e, item.href)}
                                        className="block px-4 py-3 text-white hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                ))}

                                {/* Past Editions group */}
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500">
                                        Past Editions
                                    </div>
                                    {pastEditions.map((edition) => (
                                        <div key={edition.href}>
                                            <Link
                                                href={edition.href}
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-2.5 text-sm text-white hover:text-primary transition-colors"
                                            >
                                                {edition.label}
                                            </Link>
                                            <Link
                                                href={edition.showcaseHref}
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-2 ml-3 text-xs text-gray-400 hover:text-primary transition-colors"
                                            >
                                                Winners &amp; Showcase →
                                            </Link>
                                        </div>
                                    ))}
                                </div>

                                {registerEnabled ? (
                                    <a
                                        href={registerHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-3 px-4 py-3 bg-primary/20 text-primary text-center font-medium rounded-xl border border-primary/20 active:scale-95 transition-all"
                                    >
                                        Register Now
                                    </a>
                                ) : (
                                    <span className="block mt-3 px-4 py-3 bg-white/5 text-gray-400 text-center font-medium rounded-xl border border-white/10">
                                        Registration · Soon
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
