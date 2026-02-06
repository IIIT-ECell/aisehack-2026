"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const timelineEvents = [
    {
        date: "Coming Soon",
        title: "Registration Opens",
        desc: "Get ready to apply! Applications will open shortly for India's premier Climate AI hackathon.",
        color: "from-blue-400 to-indigo-500",
    },
    {
        date: "1 Mar - 15 Mar",
        title: "Online Qualifier",
        desc: "Phase 1: Kaggle-style competition. Solve a real-world problem and submit your best models.",
        color: "from-primary to-emerald-400",
    },
    {
        date: "End of March",
        title: "Shortlist Announcement",
        desc: "Top performing teams will be selected and invited for the offline finale.",
        color: "from-secondary to-blue-400",
    },
    {
        date: "3 April - 5 April",
        title: "Grand Finale",
        desc: "Phase 2: Offline hackathon at IIIT Hyderabad. 48-hour sprint to build and showcase your final solution.",
        color: "from-purple-500 to-pink-500",
    },
];

export default function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

    return (
        <section id="timeline" ref={containerRef} className="relative py-32 px-4 container mx-auto z-10 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="text-center mb-24 relative">
                <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-block px-3 py-1 text-xs uppercase tracking-widest text-primary border border-primary/30 rounded-full mb-6"
                >
                    The Journey
                </motion.span>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white"
                >
                    Event Schedule
                </motion.h2>
            </div>

            {/* Timeline container */}
            <div className="relative max-w-4xl mx-auto">
                {/* Animated vertical line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 md:block hidden">
                    {/* Background line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                    {/* Animated fill */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-secondary to-primary"
                        style={{ height: lineHeight }}
                    />
                </div>

                <div className="space-y-16 md:space-y-24">
                    {timelineEvents.map((event, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const }}
                            className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                }`}
                        >
                            {/* Date side */}
                            <div className={`w-full md:w-1/2 z-50 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                                <motion.div
                                    className={`inline-block text-5xl md:text-6xl font-bold bg-gradient-to-r ${event.color} bg-clip-text text-transparent pb-2`}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {event.date}
                                </motion.div>
                            </div>

                            {/* Center dot */}
                            <div className="absolute left-1/2 -translate-x-1/2 md:flex hidden">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                    className="relative"
                                >
                                    {/* Outer glow */}
                                    <div className={`absolute -inset-3 rounded-full bg-gradient-to-r ${event.color} opacity-30 blur-md animate-pulse`} />

                                    {/* Inner dot */}
                                    <div className={`relative w-5 h-5 rounded-full bg-gradient-to-r ${event.color} ring-4 ring-black`} />
                                </motion.div>
                            </div>

                            {/* Content card */}
                            <div className={`w-full md:w-1/2 z-50 ${i % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                                <motion.div
                                    className="relative group"
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {/* Card glow */}
                                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${event.color} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500`} />

                                    {/* Card content */}
                                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-3">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {event.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
