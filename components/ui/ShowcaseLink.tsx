"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowUpRight } from "lucide-react";

export default function ShowcaseLink() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="fixed top-4 right-4 md:top-6 md:right-6 z-[101]"
        >
            <Link
                href="/showcase"
                className="group inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/40 hover:border-primary/70 backdrop-blur-md text-primary text-sm md:text-base font-semibold shadow-[0_0_20px_rgba(0,255,157,0.15)] hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] transition-all duration-300"
            >
                <Trophy className="w-4 h-4" />
                <span>Showcase</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
        </motion.div>
    );
}
