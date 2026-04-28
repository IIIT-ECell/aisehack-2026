"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Users, Search } from "lucide-react";
import SubmissionCard from "@/components/ui/SubmissionCard";
import SubmissionListItem from "@/components/ui/SubmissionListItem";
import Scene from "@/components/canvas/Scene";
import GlobalParticles from "@/components/canvas/GlobalParticles";
import { winners, honoraryMentions, participants, trackLabels } from "@/lib/submissions";
import type { Submission, Track, Winner } from "@/lib/submissions";
import { cn } from "@/lib/utils";

type Filter = "all" | Track;

const TRACKS: Track[] = ["flood", "pollution"];

const trackThemes: Record<Track, { ring: string; glow: string }> = {
    flood: { ring: "border-secondary/30", glow: "from-secondary/20 to-transparent" },
    pollution: { ring: "border-primary/30", glow: "from-primary/20 to-transparent" },
};

export default function ShowcasePage() {
    const [filter, setFilter] = useState<Filter>("all");
    const [query, setQuery] = useState("");

    const { scrollYProgress } = useScroll();
    const titleY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6]);

    const winnersByTrack = useMemo(
        () => Object.fromEntries(TRACKS.map((t) => [t, winners.filter((w) => w.track === t)])) as Record<Track, Winner[]>,
        []
    );
    const honoraryByTrack = useMemo(
        () => Object.fromEntries(TRACKS.map((t) => [t, honoraryMentions.filter((h) => h.track === t)])) as Record<Track, Submission[]>,
        []
    );

    const filteredParticipants = useMemo(() => {
        const q = query.trim().toLowerCase();
        return participants.filter((p) => {
            if (filter !== "all" && p.track !== filter) return false;
            if (!q) return true;
            return (
                p.teamName.toLowerCase().includes(q) ||
                p.teamLead.toLowerCase().includes(q)
            );
        });
    }, [filter, query]);

    const filterTabs: { value: Filter; label: string; count: number }[] = [
        { value: "all", label: "All", count: participants.length },
        {
            value: "flood",
            label: "Flood Detection",
            count: participants.filter((p) => p.track === "flood").length,
        },
        {
            value: "pollution",
            label: "Pollution Forecasting",
            count: participants.filter((p) => p.track === "pollution").length,
        },
    ];

    return (
        <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black noise-overlay relative">
            {/* Shared 3D ambient background — same as homepage */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Scene>
                    <GlobalParticles />
                </Scene>
            </div>

            {/* Tame the bg: dark blurred panel so foreground content reads clearly */}
            <div className="fixed inset-0 z-[1] pointer-events-none bg-black/55 backdrop-blur-md" />

            {/* Subtle scroll-driven color glows on top of overlay */}
            <div className="fixed inset-0 z-[2] pointer-events-none">
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0, 1], [0, 250]) }}
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/[0.08] rounded-full blur-[140px]"
                />
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
                    className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/[0.08] rounded-full blur-[140px]"
                />
            </div>

            {/* Scroll progress bar */}
            <motion.div
                style={{ scaleX: scrollYProgress }}
                className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary origin-left z-[100]"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to home
                </Link>

                <motion.div
                    style={{ y: titleY, opacity: titleOpacity }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 md:mb-24"
                >
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary/80 font-medium mb-4">
                        AISEHack 2026 · Phase 2
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-primary/90 to-secondary bg-clip-text text-transparent leading-[1.05] mb-6">
                        Submissions Showcase
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
                        The teams who turned code into climate action. Two tracks, dozens of teams,
                        one shared mission.
                    </p>
                </motion.div>

                {/* Winners — grouped by track */}
                <Section
                    title="Winners"
                    subtitle="Top three from each track"
                    icon={Trophy}
                    accent="text-yellow-400"
                >
                    <div className="space-y-12">
                        {TRACKS.map((track) => (
                            <TrackBlock
                                key={track}
                                track={track}
                                items={winnersByTrack[track]}
                                renderItem={(w) => (
                                    <SubmissionCard key={w.teamName} entry={w} variant="winner" />
                                )}
                            />
                        ))}
                    </div>
                </Section>

                {/* Honorary mentions — grouped by track */}
                <Section
                    title="Honorary Mentions"
                    subtitle="Standout efforts beyond the podium"
                    icon={Medal}
                    accent="text-secondary"
                >
                    <div className="space-y-12">
                        {TRACKS.map((track) => (
                            <TrackBlock
                                key={track}
                                track={track}
                                items={honoraryByTrack[track]}
                                renderItem={(h) => (
                                    <SubmissionCard key={h.teamName} entry={h} variant="honorary" />
                                )}
                            />
                        ))}
                    </div>
                </Section>

                {/* All participants */}
                <Section
                    title="All Participants"
                    subtitle={`${participants.length} teams who reached the final submission`}
                    icon={Users}
                    accent="text-gray-400"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by team or lead…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 focus:border-primary/40 focus:bg-white/[0.06] text-sm text-white placeholder-gray-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs md:text-sm font-medium border transition-colors duration-200",
                                        filter === tab.value
                                            ? "bg-primary/15 border-primary/40 text-primary"
                                            : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06]"
                                    )}
                                >
                                    {tab.label}
                                    <span className="ml-2 text-[10px] opacity-70">{tab.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        layout
                        className="space-y-2"
                        transition={{ layout: { duration: 0.3, ease: "easeOut" } }}
                    >
                        {filteredParticipants.map((p) => (
                            <SubmissionListItem key={p.teamName} entry={p} />
                        ))}
                        {filteredParticipants.length === 0 && (
                            <p className="text-sm text-gray-500 italic py-8 text-center">
                                No teams match your search.
                            </p>
                        )}
                    </motion.div>
                </Section>
            </div>
        </main>
    );
}

function Section({
    title,
    subtitle,
    icon: Icon,
    accent,
    children,
}: {
    title: string;
    subtitle: string;
    icon: typeof Trophy;
    accent: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-16 md:mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-2"
            >
                <Icon className={`w-6 h-6 md:w-7 md:h-7 ${accent}`} />
                <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
            </motion.div>
            <p className="text-sm text-gray-500 mb-8 md:mb-10 ml-9 md:ml-10">{subtitle}</p>
            {children}
        </section>
    );
}

function TrackBlock<T extends Submission>({
    track,
    items,
    renderItem,
}: {
    track: Track;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}) {
    if (items.length === 0) return null;
    const theme = trackThemes[track];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="relative"
        >
            {/* track-tinted glow behind cards */}
            <div className={cn("absolute -inset-4 rounded-3xl bg-gradient-to-br opacity-50 blur-2xl pointer-events-none", theme.glow)} />

            <div className={cn("relative pl-4 border-l-2 mb-5", theme.ring)}>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-medium">
                    Track
                </p>
                <h3 className="text-lg md:text-xl font-semibold text-white">
                    {trackLabels[track]}
                </h3>
            </div>

            <div className="relative grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => renderItem(item))}
            </div>
        </motion.div>
    );
}
