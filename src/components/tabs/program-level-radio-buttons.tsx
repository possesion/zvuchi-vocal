'use client';

import { Box, RadioCards } from '@radix-ui/themes';
import { Lvl, MentorLevelValue } from '@/app/programs/types';

interface ProgramLevelRadioButtonsProps {
    onLevelChange?: (level: MentorLevelValue) => void;
    levels: Lvl[]
}

export function ProgramLevelRadioButtons({ levels, onLevelChange }: ProgramLevelRadioButtonsProps) {

    if (!levels || levels.length === 0) {
        return null;
    }

    const handleValueChange = (value: string) => {
        onLevelChange?.(value as MentorLevelValue);
    };

    return (
        <Box className='relative' maxWidth="200px">
            <RadioCards.Root
                defaultValue={String(levels.at(0)?.value)}
                onValueChange={handleValueChange}
                highContrast
                color='violet'
                className="relative"
                columns={{ initial: "2" }}
                gap='2'
                size='1'
            >
                {levels.map(({ title, value }) => {                    
                    return (
                        <RadioCards.Item
                            key={value}
                            value={String(value)}
                        >
                            {title}
                        </RadioCards.Item>
                    );
                })}
            </RadioCards.Root>
        </Box>
    );
}
