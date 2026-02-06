"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import Image from "next/image";

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/aborjobs", label: "Twitter" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/anrfindia", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/precog-iiith", label: "GitHub" },
    { icon: Mail, href: "mailto:aisehack@iiit.ac.in", label: "Email" },
];

const footerLinks = [
    { label: "ANRF India", href: "https://anrf.gov.in" },
    { label: "IIIT Hyderabad", href: "https://www.iiit.ac.in" },
    { label: "Contact", href: "mailto:aisehack@iiit.ac.in" },
];

const partners = [
    { name: "ANRF", logo: "/logos/anrf.png", href: "https://anrf.gov.in" },
    { name: "IIT Delhi", logo: "/logos/iitd.png", href: "https://home.iitd.ac.in" },
    { name: "IIIT Hyderabad", logo: "/logos/iiith.png", href: "https://www.iiit.ac.in" },
    { name: "E-Cell IIITH", logo: "/logos/ecell.png", href: "https://ecell.iiit.ac.in" },
];

export default function Footer() {
    return (
        <footer className="relative pt-10 pb-20 px-4 border-t border-white/5">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-primary/10 to-transparent blur-[100px] pointer-events-none" />

            <div className="container mx-auto relative">
                {/* Partner Logos */}
                <div className="mb-16">
                    <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-16">
                        Organized by
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {partners.map((partner, i) => (
                            <motion.a
                                key={i}
                                href={partner.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-48 h-24 md:w-64 md:h-32 relative flex items-center justify-center">
                                    <Image
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <span className="block text-center text-xs text-gray-500 mt-2 group-hover:text-primary transition-colors">
                                    {partner.name}
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Logo and tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left"
                    >
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            AISEHack 2026
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Building AI for Climate, Sustainability & Impact
                        </p>
                    </motion.div>

                    {/* Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        {footerLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm flex items-center gap-1 group"
                            >
                                {link.label}
                                {link.href.startsWith("http") && (
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </a>
                        ))}
                    </motion.div>

                    {/* Social links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4"
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

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>
                        © 2026 AISEHack. Organized under{" "}
                        <a href="https://anrf.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary">
                            MAHA AI-SE initiative
                        </a>{" "}
                        by ANRF.
                    </p>
                </div>
            </div>
        </footer>
    );
}
