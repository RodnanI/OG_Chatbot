import React from 'react';
import Link from 'next/link';
import { Menu, ChevronUp, Settings, ChartBar, Share2 } from 'lucide-react';

const BurgerMenu = ({ onShareClick }: { onShareClick: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Menu"
            >
                {isOpen ? (
                    <ChevronUp className="w-6 h-6 text-theme" />
                ) : (
                    <Menu className="w-6 h-6 text-theme" />
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-secondary rounded-lg shadow-xl border border-theme overflow-hidden z-[100]">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onShareClick();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-theme hover:bg-secondary-hover flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share Chats</span>
                        </button>
                        <Link
                            href="/settings"
                            className="w-full px-4 py-2 text-left text-theme hover:bg-secondary-hover flex items-center gap-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </Link>
                        <Link
                            href="/statistics"
                            className="w-full px-4 py-2 text-left text-theme hover:bg-secondary-hover flex items-center gap-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <ChartBar className="w-4 h-4" />
                            <span>Statistics</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BurgerMenu;