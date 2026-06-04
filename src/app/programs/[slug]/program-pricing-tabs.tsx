'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ProgramPricingTabsProps, Package } from '../types';

export function ProgramPricingTabs({ packages }: ProgramPricingTabsProps) {
    const [activeTab, setActiveTab] = useState('0');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + '₽';
    };

    const pricePerLesson = (pkg: Package) => {
        return Math.round(pkg.price / pkg.lessons_count);
    };

    if (!packages || packages.length === 0) {
        return null;
    }

    return (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="flex gap-2 mb-6 border-b border-white/10">
                {packages.map((pkg, index) => (
                    <Tabs.Trigger
                        key={index}
                        value={String(index)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === String(index)
                                ? 'border-brand text-white'
                                : 'border-transparent text-white/60 hover:text-white'
                        }`}
                    >
                        {pkg.lessons_count} занятий
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {packages.map((pkg, index) => (
                <Tabs.Content key={index} value={String(index)} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-baseline gap-3">
                            <span className="animate-[fade-in_1s_ease-in] text-4xl font-bold text-white">
                                {formatPrice(pkg.price)}
                            </span>
                        </div>
                        <p className="text-sm text-white/60">
                            ({formatPrice(pricePerLesson(pkg))} за урок)
                        </p>
                    </div>
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
}
