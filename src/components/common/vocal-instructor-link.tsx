'use client';

import Link from "next/link";
import type { FC } from "react";
import VocalInstructor from "../sections/vocal-instructor";
import type { VocalInstructorData } from "../sections/vocal-instructor";
import { trackEvent } from "@/hooks/use-yandex-metrica";

interface VocalInstructorLinkProps {
    idx: number;
    instructor: VocalInstructorData;
}

export const VocalInstructorLink: FC<VocalInstructorLinkProps> = ({ instructor, idx }) => {
    const handleWatchMentor = (mentor: string) => {
        trackEvent('watch-mentor', { mentor });
    };

    return (
        <Link
            onClick={() => handleWatchMentor(instructor.name)}
            href={`/instructors/${instructor.slug}`}
            className="block cursor-pointer"
        >
            <VocalInstructor instructor={instructor} showTip={idx === 0} />
        </Link>
    )
}