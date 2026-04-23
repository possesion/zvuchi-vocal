'use client';

import { ImageUploader, type ImageUploadStrategy } from '@/components/common/image-uploader';

interface GalleryUploaderProps {
    onUploaded: (url: string) => void;
}

const galleryStrategy: ImageUploadStrategy = {
    label: 'Добавить фото',
    maxSizeMb: 10,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/v1/concert-photos', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.url;
    },
};

export function GalleryUploader({ onUploaded }: GalleryUploaderProps) {
    return (
        <ImageUploader
            strategy={galleryStrategy}
            variant="panel"
            onUploaded={onUploaded}
        />
    );
}
