'use client';

interface SoundWaveProps {
    bars?: number;
    className?: string;
    color?: string;
}

export const SoundWave = ({
    bars = 40,
    className = '',
    color = 'bg-white/60',
}: SoundWaveProps) => {
    return (
        <div
            className={`flex items-center justify-center gap-1 ${className}`}
            aria-hidden="true"
        >
            {Array.from({ length: bars }).map((_, i) => (
                <span
                    key={i}
                    className={`sound-wave-bar w-1 rounded-full ${color}`}
                    style={{
                        animationDelay: `${(i * 60) % 1200}ms`,
                        animationDuration: `${800 + (i % 5) * 150}ms`,
                    }}
                />
            ))}
        </div>
    );
};
