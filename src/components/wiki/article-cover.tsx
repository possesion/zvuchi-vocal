'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ArticleCoverProps {
    src: string;
    alt: string;
}

export function ArticleCover({ src, alt }: ArticleCoverProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                id="article-cover"
                onClick={() => setOpen(true)}
                className="relative mx-auto mb-6 block h-48 w-full max-w-lg overflow-hidden rounded-sm cursor-zoom-in md:h-64"
                aria-label="Открыть обложку"
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 512px"
                    priority
                />
            </button>

            {open && createPortal(
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
                    onClick={() => setOpen(false)}
                >
                    <button
                        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                        aria-label="Закрыть"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt}
                            className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain rounded-sm"
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
