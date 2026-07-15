'use client';

import { useMemo, useState } from 'react';
import { Text } from '@radix-ui/themes';
import { ProgramPricingTabs } from './program-pricing-tabs';
import { ProgramLevelRadioButtons } from '@/components/tabs/program-level-radio-buttons';
import { Package, MentorLevelValue, } from '../types';
import { MentorLevel } from '../constants';

interface ProgramPricingClientProps {
    packages: Package[];
}

export function ProgramPricingClient({ packages }: ProgramPricingClientProps) {
    const [selectedLevel, setSelectedLevel] = useState<MentorLevelValue>(MentorLevel.expert.value);
    const levels = useMemo(() => Object.values(MentorLevel), []);

    return (
        <>
            <section className='flex justify-between items-start'>
                <div>
                    <h2 className="text-2xl font-bold mb-2">Стоимость</h2>
                    <Text className='text-nowrap' weight='bold' size='1'>*Выбери уровень педагога</Text>
                </div>
                <ProgramLevelRadioButtons levels={levels} onLevelChange={setSelectedLevel} />
            </section>
            <ProgramPricingTabs
                packages={packages}
                selectedLevel={selectedLevel}
            />
        </>
    );
}
