// src/components/BurgerMenu.tsx
import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronUp, Settings, ChartBar, Share2, Inbox, FolderOpen } from 'lucide-react';

const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const BurgerMenu = ({ onShareClick }: { onShareClick: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-secondary rounded-lg transition-all duration-200"
                aria-label="Menu"
            >
                {isOpen ? (
                    <ChevronUp className="w-6 h-6 text-theme" />
                ) : (
                    <Menu className="w-6 h-6 text-theme" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute bottom-full left-0 mb-2 w-48 bg-secondary rounded-lg shadow-xl border border-theme overflow-hidden z-[100]"
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    onShareClick();
                                    setIsOpen(false);
                                }}
                                className="hover-effect w-full px-4 py-2 text-left text-theme flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share Chats</span>
                            </button>
                            <Link
                                href="/files"
                                className="hover-effect w-full px-4 py-2 text-left text-theme flex items-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <FolderOpen className="w-4 h-4" />
                                <span>Files</span>
                            </Link>
                            <Link
                                href="/bulletin"
                                className="hover-effect w-full px-4 py-2 text-left text-theme flex items-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <Inbox className="w-4 h-4" />
                                <span>Report Bug</span>
                            </Link>
                            <Link
                                href="/settings"
                                className="hover-effect w-full px-4 py-2 text-left text-theme flex items-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </Link>
                            <Link
                                href="/statistics"
                                className="hover-effect w-full px-4 py-2 text-left text-theme flex items-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <ChartBar className="w-4 h-4" />
                                <span>Statistics</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BurgerMenu;