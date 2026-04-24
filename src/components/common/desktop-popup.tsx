'use client';

import { useState, useRef, useEffect } from 'react';
import { CircleButton, ContactItems } from './call-button';

export function DesktopPopup() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} className="fixed bottom-18 right-12 z-50 flex items-end gap-3">
            {open && (
                <div className="w-80 rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-150 mb-0">
                    <p className="text-center text-sm text-gray-500 py-3 px-4 border-b border-gray-100">
                        Как вам удобнее с нами связаться?
                    </p>
                    <ContactItems onClose={() => setOpen(false)} />
                    <button
                        onClick={() => setOpen(false)}
                        className="w-full py-3 text-center text-sm font-medium text-blue-500 border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                        Отмена
                    </button>
                </div>
            )}
            <CircleButton onClick={() => setOpen((v) => !v)} />
        </div>
    );
}
