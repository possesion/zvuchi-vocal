'use client';

import { Tabs } from '@radix-ui/themes';
import { ProgramPricingTabsProps, Package } from '../types';

export function ProgramPricingTabs({ packages }: ProgramPricingTabsProps) {

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
        <Tabs.Root defaultValue={String(packages.at(0)?.lessons_count)} className="w-full">
            <Tabs.List color='red'>
                {packages.map((pkg) => (
                    <Tabs.Trigger
                        key={pkg.price}
                        value={String(pkg.lessons_count)}
                        className={`px-4 py-2 text-sm font-medium -mb-px`}
                    >
                        {pkg.lessons_count} занятий
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {packages.map((pkg) => (
                <Tabs.Content key={pkg.price} value={String(pkg.lessons_count)} className="space-y-4">
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
