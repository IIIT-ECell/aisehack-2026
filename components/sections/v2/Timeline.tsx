"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const timelineEvents = [
    {
        date: "Until June 16",
        title: "Registration Open",
        desc: "Complete the registration form to express your interest. Only registered participants receive Kaggle competition invites — accurate email is essential.",
        color: "from-blue-400 to-indigo-500",
    },
    {
        date: "Jun 16 – Jul 16",
        title: "Phase 1: Online Qualifier",
        desc: "Battle on the private Kaggle competition. Submit your best models across the Remote Sensing and Polymer tracks.",
        color: "from-primary to-emerald-400",
    },
    {
        date: "3rd Week of July",
        title: "Phase 1 Shortlist",
        desc: "Top performing teams from Phase 1 are announced via email and the official website, advancing to Phase 2.",
        color: "from-secondary to-blue-400",
    },
    {
        date: "Jul 20 – Aug 7",
        title: "Phase 2: Online Qualifier",
        desc: "A second online sprint on Kaggle. Refine, generalise and stress-test your models against tougher tasks.",
        color: "from-cyan-400 to-secondary",
    },
    {
        date: "2nd Week of August",
        title: "Phase 2 Shortlist",
        desc: "Finalists are announced. Problem statement and data for the Grand Finale are released the same week.",
        color: "from-secondary to-purple-400",
    },
    {
        date: "Sep 2 – 3, 2026",
        title: "Phase 3: Grand Finale",
        desc: "3-day offline sprint in Goa. Finalists are sponsored to attend, working alongside researchers from Galaxeye and IIT Madras.",
        color: "from-purple-500 to-pink-500",
    },
];

export default function TimelineV2() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

    return (
        <section id="timeline" ref={containerRef} className="relative py-32 px-4 container mx-auto z-10 overflow-hidden">
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

            <div className="relative max-w-4xl mx-auto">
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 md:block hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
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
                            <div className={`w-full md:w-1/2 z-50 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                                <motion.div
                                    className={`inline-block text-4xl md:text-5xl font-bold bg-gradient-to-r ${event.color} bg-clip-text text-transparent pb-2`}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {event.date}
                                </motion.div>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 md:flex hidden">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                    className="relative"
                                >
                                    <div className={`absolute -inset-3 rounded-full bg-gradient-to-r ${event.color} opacity-30 blur-md animate-pulse`} />
                                    <div className={`relative w-5 h-5 rounded-full bg-gradient-to-r ${event.color} ring-4 ring-black`} />
                                </motion.div>
                            </div>

                            <div className={`w-full md:w-1/2 z-50 ${i % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                                <motion.div
                                    className="relative group"
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${event.color} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500`} />
                                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-3">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">{event.desc}</p>
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
