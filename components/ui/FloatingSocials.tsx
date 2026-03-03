"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin } from "lucide-react";

const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/aisehack", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/precog-iiith", label: "GitHub" },
];

export default function FloatingSocials() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector("footer");
            if (!footer) {
                setIsVisible(true);
                return;
            }

            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Hide the floating socials when the footer's social area is visible
            // We use a threshold: when footer top is within the viewport
            const footerInView = footerRect.top < windowHeight - 80;
            setIsVisible(!footerInView);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3"
                >
                    {socialLinks.map((social, i) => (
                        <motion.a
                            key={i}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="w-11 h-11 rounded-full glass-strong flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-lg shadow-black/40"
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <social.icon className="w-[18px] h-[18px]" />
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
