'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

interface UserAvatarPictureProps {
    avatarUrl: string | null;
    alt: string;
    size: number;
}

export const UserAvatarPicture: FC<UserAvatarPictureProps> = ({ avatarUrl, alt, size }) => {
    const [failed, setFailed] = useState(false);

    if (!avatarUrl || avatarUrl.trim() === '' || failed) return null;

    return (
        <Image
            src={avatarUrl}
            alt={alt}
            width={size}
            height={size}
            className="rounded-full object-cover"
            onError={() => setFailed(true)}
        />
    );
};
