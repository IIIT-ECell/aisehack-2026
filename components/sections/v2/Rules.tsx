"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    FileCode2,
    RefreshCw,
    Ban,
    Cpu,
    Plane,
    ChevronDown,
    Linkedin,
    ExternalLink,
    AlertTriangle,
} from "lucide-react";

const rules = [
    {
        icon: FileCode2,
        title: "Notebook-Only Competition",
        summary: "All submissions must be backed by a compliant Kaggle Notebook.",
        details: [
            "This is a notebook/code-only competition — prediction-only submissions will be invalidated.",
            "Every submission description must include a link to the notebook used to generate it.",
            "The default/pinned version of the notebook must correspond exactly to the version that produced the submitted results.",
            "The linked notebook must be shared (view access) with all competition hosts.",
            "Missing notebook links or failure to share with all hosts will result in invalidation.",
        ],
    },
    {
        icon: RefreshCw,
        title: "Reproducibility Requirement",
        summary: "Your notebook must reproduce submitted results end-to-end.",
        details: [
            "After the competition, the pinned/default notebook version linked in your best submission will be executed.",
            "The notebook must run end-to-end without manual intervention.",
            "It must execute within Kaggle's compute and time limits.",
            "Reproduced results must match the submitted score.",
            "If the notebook does not reproduce the score, the submission is invalidated regardless of leaderboard position.",
        ],
    },
    {
        icon: Cpu,
        title: "Compute Allocation",
        summary: "30 hours / week / participant of Kaggle GPU compute.",
        details: [
            "Each registered participant gets access to Kaggle GPU compute instances for 30 hours per week.",
            "Other freely available compute (e.g. Google Colab) can be leveraged for experiments and prototyping.",
            "Use Kaggle instances for final/reproducible runs that count for the leaderboard.",
            "Plan your experiments — compute is finite and shared per participant.",
        ],
    },
    {
        icon: Ban,
        title: "External Data & Artifact Restrictions",
        summary: "No private artifacts, external datasets, or pre-trained weights allowed.",
        details: [
            "No private artifacts or external files may be linked.",
            "No external datasets (public or private) may be used.",
            "No uploaded pretrained weights, checkpoints, embeddings, cached features, or processed artifacts.",
            "All training outputs must be generated during notebook execution.",
            "Public code repositories (e.g., model architecture scripts from GitHub) are permitted, provided no external data is used and the pipeline runs reproducibly within Kaggle.",
        ],
    },
    {
        icon: Plane,
        title: "Phase 3 Finale (Goa)",
        summary: "Nominal on-campus fee · Travel arranged by participants.",
        details: [
            "Selected Phase 3 participants will be charged a nominal registration fee covering merchandise and food/refreshments on campus.",
            "Travel and stay arrangements to Goa must be made by participants themselves.",
        ],
    },
];

function RuleCard({ rule, index }: { rule: (typeof rules)[0]; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
        >
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left group">
                <div className="relative rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm p-6 transition-all duration-300">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                            <rule.icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                    {rule.title}
                                </h3>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0 text-gray-500"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </motion.div>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{rule.summary}</p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <ul className="mt-5 ml-16 space-y-2.5">
                                    {rule.details.map((detail, j) => (
                                        <li
                                            key={j}
                                            className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"
                                        >
                                            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </button>
        </motion.div>
    );
}

export default function RulesV2() {
    return (
        <section id="rules" className="relative py-32 px-4 container mx-auto z-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="text-center mb-20 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 border border-red-400/30 rounded-full mb-6"
                >
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    <span className="text-xs uppercase tracking-widest text-red-400">Important</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    <span className="bg-gradient-to-r from-red-400 via-white to-primary bg-clip-text text-transparent">
                        Competition Rules
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto"
                >
                    Read these carefully — non-compliance will result in disqualification.
                </motion.p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4 mb-12">
                {rules.map((rule, i) => (
                    <RuleCard key={i} rule={rule} index={i} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="max-w-3xl mx-auto mb-16"
            >
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200/80 leading-relaxed">
                        <span className="font-semibold text-yellow-400">Note:</span>{" "}
                        Successful leaderboard placement does not guarantee eligibility unless all
                        requirements above are satisfied. For full rules, see the Rules tab on each
                        theme&apos;s Kaggle page once invites are sent.
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="max-w-xl mx-auto text-center"
            >
                <div className="relative rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm p-8">
                    <div className="absolute -inset-px rounded-2xl bg-blue-500/10 blur-xl opacity-50 pointer-events-none" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mx-auto mb-5">
                            <Linkedin className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                            Follow ANRF India on LinkedIn for regular competition updates,
                            announcements, clarifications, and important deadlines.
                        </p>
                        <a
                            href="https://www.linkedin.com/company/aisehack"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 group"
                        >
                            <Linkedin className="w-4 h-4" />
                            Follow on LinkedIn
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
