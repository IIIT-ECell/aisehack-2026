"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { REGISTRATION_URL } from "./config";

const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/aisehack", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/precog-iiith", label: "GitHub" },
];

const footerLinks = [
    { label: "Register", href: REGISTRATION_URL },
    { label: "Past Editions", href: "/past-editions/edition-1" },
    { label: "ANRF India", href: "https://anrf.gov.in" },
];

const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

// TODO: add Galaxeye and IIT Madras logos to /public/logos and wire them in.
const partners = [
    { name: "ANRF", logo: `${bp}/logos/anrf.webp`, href: "https://anrf.gov.in", hasLogo: true },
    { name: "Galaxeye", logo: "", href: "https://galaxeye.space", hasLogo: false },
    { name: "IIT Madras", logo: "", href: "https://www.iitm.ac.in", hasLogo: false },
];

export default function FooterV2() {
    return (
        <footer className="relative pt-10 pb-12 px-4 border-t border-white/5">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-primary/10 to-transparent blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative">
                <div className="mb-16">
                    <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-12">
                        Organised by ANRF · In coordination with
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16">
                        {partners.map((partner, i) => (
                            <motion.a
                                key={i}
                                href={partner.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group transition-all duration-300 flex flex-col items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-40 h-20 md:w-56 md:h-28 relative flex items-center justify-center p-4 md:p-6 transition-all">
                                    {partner.hasLogo ? (
                                        <Image
                                            src={partner.logo}
                                            alt={partner.name}
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                            {partner.name}
                                        </span>
                                    )}
                                </div>
                                <span className="block text-center text-[10px] md:text-xs text-gray-500 mt-3 group-hover:text-primary transition-colors tracking-wider uppercase font-medium">
                                    {partner.name}
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left md:flex-1"
                    >
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            AISEHack · 2nd Edition
                        </h3>
                        <p className="text-gray-500 text-sm">AI for Science & Engineering · Molecules and Space</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        {footerLinks.map((link, i) => {
                            const isExternal = link.href.startsWith("http");
                            const className =
                                "text-gray-400 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-1 group";
                            return isExternal ? (
                                <a
                                    key={i}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={className}
                                >
                                    {link.label}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ) : (
                                <Link key={i} href={link.href} className={className}>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 md:flex-1 md:justify-end"
                    >
                        {socialLinks.map((social, i) => (
                            <motion.a
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all duration-300"
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <social.icon className="w-4 h-4" />
                            </motion.a>
                        ))}
                    </motion.div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>
                        © 2026 AISEHack. Organised under the AI for Science &amp; Engineering initiative by{" "}
                        <a
                            href="https://anrf.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary/70 hover:text-primary transition-colors"
                        >
                            ANRF
                        </a>
                        .
                    </p>
                    <a
                        href="https://www.linkedin.com/company/aisehack"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-400/70 hover:text-blue-400 transition-colors"
                    >
                        <Linkedin className="w-3.5 h-3.5" />
                        Follow us on LinkedIn for updates
                    </a>
                </div>
            </div>
        </footer>
    );
}
