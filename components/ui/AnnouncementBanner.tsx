"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rocket, X } from "lucide-react";

export default function AnnouncementBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show on every page load; a small delay eases it in after the page settles.
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="fixed top-6 right-4 sm:right-6 z-[60] w-[calc(100%-2rem)] max-w-sm pointer-events-none"
                >
                    <div className="pointer-events-auto relative flex items-start gap-4 rounded-2xl border border-primary/30 bg-black/80 backdrop-blur-xl p-4 pr-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/40 to-secondary/40 opacity-30 blur-lg -z-10" />

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-black">
                            <Rocket className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
                                Announcement
                            </p>
                            <p className="text-sm text-white font-medium leading-snug">
                                Round 2 launches on <span className="text-primary">July 27</span>. Sharpen your models and get ready for Phase 2!
                            </p>
                        </div>

                        <button
                            onClick={() => setVisible(false)}
                            aria-label="Dismiss announcement"
                            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
