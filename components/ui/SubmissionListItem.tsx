"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, Github, ExternalLink, Box, Presentation } from "lucide-react";
import type { Submission } from "@/lib/submissions";
import { trackLabels } from "@/lib/submissions";
import { cn } from "@/lib/utils";

const trackAccent: Record<Submission["track"], string> = {
    flood: "bg-secondary/15 text-secondary border-secondary/30",
    pollution: "bg-primary/15 text-primary border-primary/30",
};

function LinkPill({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-primary/15 hover:border-primary/40 text-xs text-gray-300 hover:text-white transition-colors duration-200"
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
        </a>
    );
}

export default function SubmissionListItem({ entry }: { entry: Submission }) {
    const [open, setOpen] = useState(false);

    const linkCount = [
        entry.reportLink,
        entry.githubLink,
        entry.kaggleLink,
        entry.modelCheckpointLink,
        entry.presentationLink,
    ].filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
            className={cn(
                "rounded-xl border border-white/10 bg-black/30 backdrop-blur-md overflow-hidden transition-colors",
                open ? "border-white/25 bg-black/45" : "hover:border-white/20 hover:bg-black/40"
            )}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-4 px-4 py-3.5 md:px-5 md:py-4 text-left"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-white text-base md:text-lg truncate">
                            {entry.teamName}
                        </span>
                        <span
                            className={cn(
                                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap",
                                trackAccent[entry.track]
                            )}
                        >
                            {entry.track}
                        </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 truncate">
                        Led by {entry.teamLead}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-xs text-gray-500">
                        {linkCount} {linkCount === 1 ? "link" : "links"}
                    </span>
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 md:px-5 pb-4 pt-1">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium mb-2">
                                {trackLabels[entry.track]}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {entry.reportLink && <LinkPill href={entry.reportLink} icon={FileText} label="Report" />}
                                {entry.githubLink && <LinkPill href={entry.githubLink} icon={Github} label="Code" />}
                                {entry.kaggleLink && <LinkPill href={entry.kaggleLink} icon={ExternalLink} label="Kaggle" />}
                                {entry.modelCheckpointLink && <LinkPill href={entry.modelCheckpointLink} icon={Box} label="Model" />}
                                {entry.presentationLink && <LinkPill href={entry.presentationLink} icon={Presentation} label="Slides" />}
                                {linkCount === 0 && (
                                    <span className="text-xs text-gray-500 italic">No public links submitted</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
