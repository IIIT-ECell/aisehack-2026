"use client";

import { motion } from "framer-motion";
import { FileText, Github, ExternalLink, Box, Presentation, Award } from "lucide-react";
import type { Submission, Winner } from "@/lib/submissions";
import { trackLabels } from "@/lib/submissions";
import { cn } from "@/lib/utils";

type Props = {
    entry: Submission | Winner;
    variant?: "winner" | "honorary" | "participant";
};

const positionColors: Record<1 | 2 | 3, string> = {
    1: "from-yellow-300 to-yellow-500 text-yellow-950",
    2: "from-zinc-200 to-zinc-400 text-zinc-900",
    3: "from-amber-500 to-amber-700 text-amber-50",
};

const positionLabels: Record<1 | 2 | 3, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
};

function LinkPill({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-primary/15 hover:border-primary/40 text-xs text-gray-300 hover:text-white transition-colors duration-200"
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
        </a>
    );
}

export default function SubmissionCard({ entry, variant = "participant" }: Props) {
    const isWinner = variant === "winner" && "position" in entry;
    const isHonorary = variant === "honorary";
    const position = isWinner ? (entry as Winner).position : undefined;

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
            whileHover={{ y: -4 }}
            className={cn(
                "relative rounded-2xl border bg-black/40 backdrop-blur-md p-5 md:p-6 transition-colors duration-300",
                isWinner && "border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.08)]",
                isHonorary && "border-secondary/25",
                !isWinner && !isHonorary && "border-white/10"
            )}
        >
            {position && (
                <div
                    className={cn(
                        "absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br shadow-lg",
                        positionColors[position]
                    )}
                >
                    <Award className="w-3.5 h-3.5" />
                    {positionLabels[position]}
                </div>
            )}

            {isHonorary && (
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/20 border border-secondary/40 text-secondary">
                    Honorary
                </div>
            )}

            <div className="mb-3">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                    {trackLabels[entry.track]}
                </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                {entry.teamName}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                Led by <span className="text-gray-200">{entry.teamLead}</span>
            </p>

            <div className="flex flex-wrap gap-2">
                {entry.reportLink && <LinkPill href={entry.reportLink} icon={FileText} label="Report" />}
                {entry.githubLink && <LinkPill href={entry.githubLink} icon={Github} label="Code" />}
                {entry.kaggleLink && <LinkPill href={entry.kaggleLink} icon={ExternalLink} label="Kaggle" />}
                {entry.modelCheckpointLink && <LinkPill href={entry.modelCheckpointLink} icon={Box} label="Model" />}
                {entry.presentationLink && <LinkPill href={entry.presentationLink} icon={Presentation} label="Slides" />}
            </div>
        </motion.div>
    );
}
