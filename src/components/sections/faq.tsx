'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from '@/app/constants';

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={open}
            >
                <span className="text-base font-semibold text-white md:text-lg">{question}</span>
                <span className="shrink-0 text-brand">
                    {open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out pb-2 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <p className="overflow-hidden text-sm leading-relaxed text-white/70 md:text-base">
                    {answer}
                </p>
            </div>
        </div>
    );
}

export function Faq() {
    return (
        // group relative flex w-full shrink-0 flex-col rounded-sm bg-black/85 p-6 shadow-md brightness-96 md:flex-row
        <section className="mt-16">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-white md:text-4xl xl:text-5xl">
                Частые вопросы
            </h2>
            <div className="mx-auto max-w-3xl bg-black/65 rounded-sm shadow-md brightness-96 px-6">
                {FAQ_ITEMS.map((item) => (
                    <FaqItem key={item.question} {...item} />
                ))}
            </div>
        </section>
    );
}
