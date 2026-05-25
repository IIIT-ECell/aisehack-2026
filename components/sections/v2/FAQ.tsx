"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Who can participate in AISEHack?",
        answer: "Participants can be anyone — from college students to working professionals and independent researchers. AISEHack is open to all.",
    },
    {
        question: "What is the team size?",
        answer: "Teams can have 1–5 members. We encourage diverse teams with complementary skills across AI, domain sciences, and engineering.",
    },
    {
        question: "Is there a registration fee?",
        answer: "There is no registration fee for the online qualifiers (Phase 1 and Phase 2). Selected Phase 3 participants will be charged a nominal on-campus fee for merchandise and food/refreshments.",
    },
    {
        question: "How do I receive the Kaggle competition invite?",
        answer: "Only registered participants receive the private Kaggle competition invite link, sent to the email address you submit in the registration form. Make sure it is accurate.",
    },
    {
        question: "How much compute do I get?",
        answer: "Each participant gets 30 hours / week of Kaggle GPU instances. You can use Google Colab and other free compute for prototyping, and reserve Kaggle compute for your final, reproducible runs.",
    },
    {
        question: "Where is the Grand Finale held?",
        answer: "The 3-day offline Grand Finale (Phase 3) will be held in Goa in the 1st week of September 2026. Exact dates will be announced shortly.",
    },
    {
        question: "Is travel to Goa covered?",
        answer: "No — travel arrangements are to be made by participants themselves. Selected finalists are sponsored to attend the offline sprint.",
    },
    {
        question: "What datasets and problem statements will be provided?",
        answer: "Datasets and problem statements will be released on Kaggle when each phase begins. Phase 3 data and the final problem statement will be announced in the 2nd week of August 2026.",
    },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="group"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300"
            >
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-primary transition-colors">
                        {faq.question}
                    </h3>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 text-gray-400"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <p className="mt-4 text-gray-400 leading-relaxed pr-8">{faq.answer}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </motion.div>
    );
}

export default function FAQV2() {
    return (
        <section id="faq" className="relative pt-32 pb-16 px-4 container mx-auto z-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-secondary/5 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="text-center mb-16 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full mb-6"
                >
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase tracking-widest text-primary">Got Questions?</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    <span className="bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                        FAQ
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto"
                >
                    Everything you need to know about AISEHack — 2nd Edition
                </motion.p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, i) => (
                    <FAQItem key={i} faq={faq} index={i} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-center mt-16"
            >
                <p className="text-gray-400 mb-4">Still have questions? We&apos;re here to help.</p>
                <a
                    href="mailto:contact@aisehack.in"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-white transition-all duration-300"
                >
                    Contact Us
                </a>
            </motion.div>
        </section>
    );
}
