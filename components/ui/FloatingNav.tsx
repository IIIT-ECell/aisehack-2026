"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLenis } from "lenis/react";

const navItems = [
    { label: "About", href: "#about" },
    { label: "Timeline", href: "#timeline" },
    { label: "Tracks", href: "#tracks" },
    { label: "FAQ", href: "#faq" },
];

export default function FloatingNav() {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const lenis = useLenis();

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsVisible(true);
            }
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

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (href.startsWith("#")) {
            const element = document.querySelector(href);
            if (element) {
                lenis?.scrollTo(element as HTMLElement);
            }
        }
        setIsOpen(false);
    };

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
                        </div>

                        {/* CTA Button */}
                        <div
                            className="hidden md:block px-6 py-2.5 bg-primary/20 text-primary/50 text-sm font-medium rounded-full cursor-not-allowed border border-primary/20"
                        >
                            Coming Soon
                        </div>

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
                                <div
                                    className="block mt-2 px-4 py-3 bg-primary/20 text-primary/50 text-center font-medium rounded-xl cursor-not-allowed border border-primary/20"
                                >
                                    Coming Soon
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
