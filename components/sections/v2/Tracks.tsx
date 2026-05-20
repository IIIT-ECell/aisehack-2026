"use client";

import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { Satellite, Atom, ExternalLink, Info } from "lucide-react";
import {
    REGISTRATION_URL,
    TRACK_1_KAGGLE_URL,
    TRACK_1_RULES_URL,
    TRACK_2_KAGGLE_URL,
    TRACK_2_RULES_URL,
} from "./config";

const tracks = [
    {
        icon: Satellite,
        iconColor: "text-blue-400",
        glowColor: "rgba(96, 165, 250, 0.2)",
        title: "Theme 1: Remote Sensing & Yield Prediction",
        desc: "Leverage remote sensing and geospatial data to build robust AI models that can detect crop patterns and predict yields at scale — unlocking insights for food security and a changing climate.",
        attribution: "Contributed by Galaxeye",
        tags: ["Geospatial AI", "Remote Sensing", "Foundation Models"],
        kaggleLink: TRACK_1_KAGGLE_URL,
        rulesLink: TRACK_1_RULES_URL,
    },
    {
        icon: Atom,
        iconColor: "text-green-400",
        glowColor: "rgba(0, 255, 157, 0.2)",
        title: "Theme 2: Molecular Property Prediction",
        desc: "Better batteries, energy storage, materials and drugs all depend on the right set of molecules. Enable this by developing physics / operator based deep learning models for molecular property prediction.",
        attribution: "Contributed by IIT Madras",
        tags: ["Deep Learning", "Neural Operators", "Physics-Informed AI"],
        kaggleLink: TRACK_2_KAGGLE_URL,
        rulesLink: TRACK_2_RULES_URL,
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const },
    },
};

export default function TracksV2() {
    return (
        <section id="tracks" className="relative py-32 px-4 container mx-auto z-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="text-center mb-20 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest text-secondary border border-secondary/30 rounded-full mb-6">
                        Choose Your Path
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    <span className="bg-gradient-to-r from-secondary via-white to-purple-400 bg-clip-text text-transparent">
                        Competition Tracks
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl text-gray-200 max-w-2xl mx-auto"
                >
                    Two high-stakes tracks. One mission: AI for science and engineering research.
                </motion.p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {tracks.map((track, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <TiltCard glowColor={track.glowColor}>
                            <motion.div
                                className={`mb-4 p-3 bg-white/5 w-fit rounded-xl ring-1 ring-white/10 ${track.iconColor}`}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <track.icon className="w-8 h-8" />
                            </motion.div>

                            <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                {track.title}
                            </h3>

                            <p className="text-sm text-primary mb-3 font-medium">{track.attribution}</p>

                            <p className="text-gray-300 leading-relaxed mb-4">{track.desc}</p>

                            <div className="flex flex-wrap gap-2 mb-5">
                                {track.tags.map((tag, j) => (
                                    <span
                                        key={j}
                                        className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-full border border-white/10"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                                {track.kaggleLink && track.kaggleLink !== "#" ? (
                                    <a
                                        href={track.kaggleLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
                                    >
                                        Compete on Kaggle
                                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 text-sm font-medium rounded-lg border border-white/10 cursor-not-allowed">
                                        Kaggle invite — Coming Soon
                                    </span>
                                )}
                                {track.rulesLink && track.rulesLink !== "#" && (
                                    <a
                                        href={track.rulesLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group"
                                    >
                                        Rules
                                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </TiltCard>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-fit mx-auto mt-10"
            >
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-secondary/5 border border-secondary/20">
                    <Info className="w-3 h-5 text-secondary shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-250 leading-relaxed">
                        Kaggle competition links are accessible only once you have completed{" "}
                        {REGISTRATION_URL && REGISTRATION_URL !== "#" ? (
                            <a
                                href={REGISTRATION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-medium hover:underline underline-offset-2"
                            >
                                registration
                            </a>
                        ) : (
                            <span className="text-primary font-medium">registration</span>
                        )}
                        . Invites are sent to your registered email — keep it accurate.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
