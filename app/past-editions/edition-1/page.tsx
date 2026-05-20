"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Trophy } from "lucide-react";
import Scene from "@/components/canvas/Scene";
import GlobalParticles from "@/components/canvas/GlobalParticles";
import SubmissionCard from "@/components/ui/SubmissionCard";
import {
    winners,
    participants,
    trackLabels,
    type Track,
    type Winner,
} from "@/lib/submissions";

const TRACKS: Track[] = ["flood", "pollution"];

const editionFacts = [
    { icon: Calendar, label: "Dates", value: "4–5 April 2026" },
    { icon: MapPin, label: "Venue", value: "IIIT Hyderabad" },
    { icon: Trophy, label: "Prize Pool", value: "₹7,00,000" },
    { icon: Users, label: "Teams", value: `${participants.length}+ finalists` },
];

export default function PastEditionOne() {
    const winnersByTrack = useMemo(
        () =>
            Object.fromEntries(
                TRACKS.map((t) => [t, winners.filter((w) => w.track === t).sort((a, b) => a.position - b.position)])
            ) as Record<Track, Winner[]>,
        []
    );

    return (
        <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black noise-overlay relative">
            {/* Calm ambient bg (no planet — keep it light for the archive) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Scene>
                    <GlobalParticles />
                </Scene>
            </div>
            <div className="fixed inset-0 z-[1] pointer-events-none bg-black/55 backdrop-blur-md" />

            {/* Archive banner */}
            <div className="fixed top-0 left-0 right-0 z-[90] bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur-md">
                <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs md:text-sm">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-yellow-200 hover:text-yellow-100 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Back to current edition</span>
                        <span className="sm:hidden">Current edition</span>
                    </Link>
                    <span className="text-yellow-300/90 font-medium uppercase tracking-widest text-[10px] md:text-xs">
                        Archive · Edition 1
                    </span>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-24">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 md:mb-20"
                >
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary/80 font-medium mb-4">
                        AISEHack · Edition 1
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-primary/90 to-secondary bg-clip-text text-transparent leading-[1.05] mb-5">
                        Climate &amp; Sustainability
                    </h1>
                    <p className="text-base md:text-lg text-gray-400 max-w-2xl">
                        The first edition of AISEHack, organised by ANRF in coordination with IBM and IIT Delhi.
                        Teams built AI for flood detection and air-pollution forecasting.
                    </p>
                </motion.div>

                {/* Key facts strip */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-20"
                >
                    {editionFacts.map((fact) => (
                        <div
                            key={fact.label}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 md:p-5"
                        >
                            <div className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-2">
                                <fact.icon className="w-3.5 h-3.5 text-primary" />
                                {fact.label}
                            </div>
                            <div className="text-base md:text-lg font-semibold text-white">{fact.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Themes summary */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24"
                >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-400/80 font-medium mb-2">
                            Theme 1 · IBM
                        </p>
                        <h3 className="text-xl font-semibold text-white mb-1">Flood Detection</h3>
                        <p className="text-sm text-gray-400">
                            Remote sensing + geospatial AI for detecting flood-prone regions.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-green-400/80 font-medium mb-2">
                            Theme 2 · IIT Delhi
                        </p>
                        <h3 className="text-xl font-semibold text-white mb-1">Pollution Forecasting</h3>
                        <p className="text-sm text-gray-400">
                            Physics-informed / operator-based deep learning for urban air-quality prediction.
                        </p>
                    </div>
                </motion.div>

                {/* Winners */}
                <section className="mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Winners</h2>
                    </motion.div>
                    <p className="text-sm text-gray-500 mb-10 ml-9 md:ml-10">Top three from each track</p>

                    <div className="space-y-12">
                        {TRACKS.map((track) => (
                            <div key={track} className="relative">
                                <div
                                    className={
                                        "relative pl-4 border-l-2 mb-5 " +
                                        (track === "flood" ? "border-secondary/30" : "border-primary/30")
                                    }
                                >
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-medium">
                                        Track
                                    </p>
                                    <h3 className="text-lg md:text-xl font-semibold text-white">
                                        {trackLabels[track]}
                                    </h3>
                                </div>

                                <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {winnersByTrack[track].map((w) => (
                                        <SubmissionCard key={w.teamName} entry={w} variant="winner" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Full showcase CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center backdrop-blur-sm"
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">More from the edition</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                        Honorary mentions & all participants
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xl mx-auto mb-6">
                        Explore the full submission set — every finalist team, their reports, code and slides.
                    </p>
                    <Link
                        href="/past-editions/edition-1/showcase"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/40 hover:border-primary/70 text-primary text-sm font-semibold transition-all duration-300"
                    >
                        See full showcase
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
