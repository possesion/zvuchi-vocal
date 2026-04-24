'use client';

import { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { EnrollmentModal } from '@/components/modals/enrollment-modal';
import { CTA_BY_CATEGORY, DEFAULT_CTA } from './constants';

interface WikiCtaProps {
    category: string;
}

export function WikiCta({ category }: WikiCtaProps) {
    const [open, setOpen] = useState(false);
    const cta = CTA_BY_CATEGORY[category] ?? DEFAULT_CTA;

    return (
        <>
            <div className="my-8 flex flex-col gap-3 rounded-sm bg-white/5 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-md font-semibold text-white/80 sm:text-base">{cta.text}</p>
                <button
                    onClick={() => setOpen(true)}
                    className="transition-all duration-200 inline-flex shrink-0 items-center gap-2 rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95 hover:scale-110"
                >
                    {cta.button}
                    <CornerDownLeft className="h-4 w-4" />
                </button>
            </div>

            <EnrollmentModal isOpen={open} onClose={() => setOpen(false)} trackEventLabel='call_request_wiki'>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                    {cta.title}
                </h2>
            </EnrollmentModal>
        </>
    );
}
