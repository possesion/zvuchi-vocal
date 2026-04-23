'use client';

import { ImageUploader, type ImageUploadStrategy } from '@/components/common/image-uploader';

interface WikiCoverUploaderProps {
    termId: string;
    currentUrl: string;
    onChanged: (url: string) => void;
}

function createWikiCoverStrategy(termId: string, onChanged: (url: string) => void): ImageUploadStrategy {
    const endpoint = `/api/v1/wiki/${encodeURIComponent(termId)}/cover`;
    return {
        label: 'Обложка',
        maxSizeMb: 5,
        upload: async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch(endpoint, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onChanged(data.url);
            return data.url;
        },
        remove: async () => {
            await fetch(endpoint, { method: 'DELETE' });
            onChanged('');
        },
    };
}

export function WikiCoverUploader({ termId, currentUrl, onChanged }: WikiCoverUploaderProps) {
    return (
        <ImageUploader
            strategy={createWikiCoverStrategy(termId, onChanged)}
            currentUrl={currentUrl}
            variant="inline"
            onUploaded={onChanged}
            onRemoved={() => onChanged('')}
        />
    );
}
