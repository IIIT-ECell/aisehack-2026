"use client";

import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { BarChart3, Leaf, ExternalLink, Info } from "lucide-react";

const tracks = [
    {
        icon: BarChart3,
        iconColor: "text-blue-400",
        glowColor: "rgba(96, 165, 250, 0.2)",
        title: "Theme 1: Flood Detection",
        desc: "Leverage remote sensing and geospatial data to build robust AI models that can detect and predict flood-prone areas, saving lives and infrastructure.",
        attribution: "In coordination with IBM",
        tags: ["Geospatial AI", "Remote Sensing", "Computer Vision"],
        kaggleLink: "https://www.kaggle.com/t/bac2150b648148518d4c83e595e44103",
        rulesLink: "https://www.kaggle.com/competitions/aisehack-theme-1/rules",
    },
    {
        icon: Leaf,
        iconColor: "text-green-400",
        glowColor: "rgba(0, 255, 157, 0.2)",
        title: "Theme 2: Pollution Prediction",
        desc: "Tackle urban air quality by developing physics/operator based deep learning models to forecast pollution levels, enabling smarter city planning and public health interventions.",
        attribution: "In coordination with IIT Delhi",
        tags: ["Deep Learning", "Physics-Informed AI", "Forecasting"],
        kaggleLink: "https://www.kaggle.com/t/ee9471decd8d45418daaa261acd982dc",
        rulesLink: "https://www.kaggle.com/competitions/aisehack-theme-2/rules",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.215, 0.61, 0.355, 1] as const,
        },
    },
};

export default function Tracks() {
    return (
        <section id="tracks" className="relative py-32 px-4 container mx-auto z-10">
            {/* Background decoration */}
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
                        Challenge Themes
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl text-gray-200 max-w-2xl mx-auto"
                >
                    Two high-stakes themes to build high-impact solutions.
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
                            {/* Icon with rotation on hover */}
                            <motion.div
                                className={`mb-4 p-3 bg-white/5 w-fit rounded-xl ring-1 ring-white/10 ${track.iconColor}`}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <track.icon className="w-8 h-8" />
                            </motion.div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                {track.title}
                            </h3>

                            <p className="text-sm text-primary mb-3 font-medium">
                                {track.attribution}
                            </p>

                            {/* Description */}
                            <p className="text-gray-300 leading-relaxed mb-4">
                                {track.desc}
                            </p>

                            {/* Tags */}
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

                            {/* Kaggle & Rules Links */}
                            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                                <a
                                    href={track.kaggleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
                                >
                                    Compete on Kaggle
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                                <a
                                    href={track.rulesLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group"
                                >
                                    Rules
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            </div>
                        </TiltCard>
                    </motion.div>
                ))}
            </motion.div>

        {/* Registration note */}

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
                        Kaggle competition links will be accessible once you have completed{" "}
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdy8rOyH607CxQU1jtw-JwQbU7EArKf8cYVwMHDf9ubqqQt2g/viewform?pli=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline underline-offset-2"
                        >
                            registration
                        </a>
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
