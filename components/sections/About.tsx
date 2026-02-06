"use client";

import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { Globe, Cpu, Users, Leaf } from "lucide-react";

const features = [
    {
        icon: Globe,
        iconColor: "text-primary",
        glowColor: "rgba(0, 255, 157, 0.2)",
        title: "Real-World Impact",
        desc: "Work on critical challenges contributed by global leaders like IBM and IIT Delhi. Build high-impact solutions for Climate and Sustainability.",
    },
    {
        icon: Users,
        iconColor: "text-secondary",
        glowColor: "rgba(0, 184, 255, 0.2)",
        title: "Elite Networking",
        desc: "Finalists will head to IIIT Hyderabad for an intensive offline finale, connecting with top researchers and industry pioneers.",
    },
    {
        icon: Cpu,
        iconColor: "text-blue-400",
        glowColor: "rgba(96, 165, 250, 0.2)",
        title: "The Kaggle Arena",
        desc: "Battle it out on the world’s most renowned data science platform. Registered participants get exclusive access.",
    },
    {
        icon: Leaf,
        iconColor: "text-green-400",
        glowColor: "rgba(74, 222, 128, 0.2)",
        title: "Viksit Bharat 2047",
        desc: "Contribute to the national vision of a self-reliant, technologically advanced India by safeguarding our future.",
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

export default function About() {
    return (
        <section id="about" className="relative py-32 px-4 container mx-auto z-10">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="text-center mb-20 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest text-primary border border-primary/30 rounded-full mb-6">
                        The Mission
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    <span className="bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                        Safeguard Our Future
                    </span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto text-left md:text-center"
                >
                    <p className="mb-6">
                        The Anusandhan National Research Foundation (ANRF) invites you to AISEHack, India’s premier hackathon at the intersection of
                        Artificial Intelligence, Science, and Engineering. This isn't just a coding competition; it’s a mission to safeguard our future.
                    </p>
                    <p>
                        As we face unprecedented environmental shifts, we are calling on the brightest minds—the researchers, the engineers, and the AI enthusiasts—to
                        build high-impact solutions for Climate and Sustainability. Whether you are passionate about earth sciences, remote sensing, geospatial
                        foundation models, predictive modeling or deep neural operators, AISEHack provides the platform, the data, and the community to make your mark.
                    </p>
                </motion.div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {features.map((feature, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <TiltCard glowColor={feature.glowColor}>
                            {/* Icon with rotation on hover */}
                            <motion.div
                                className={`mb-4 p-3 bg-white/5 w-fit rounded-xl ring-1 ring-white/10 ${feature.iconColor}`}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <feature.icon className="w-8 h-8" />
                            </motion.div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-300 leading-relaxed">
                                {feature.desc}
                            </p>
                        </TiltCard>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
