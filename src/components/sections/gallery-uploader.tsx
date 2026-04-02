'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Check, Loader } from 'lucide-react';
import Image from 'next/image';

interface GalleryUploaderProps {
    onUploaded: (url: string) => void;
}

export function GalleryUploader({ onUploaded }: GalleryUploaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        setError('');
        setPreview(URL.createObjectURL(selected));
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/v1/concert-photos', {
                method: 'POST',
                headers: { Authorization: 'Bearer admin' },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка загрузки');
                return;
            }

            onUploaded(data.url);
            handleCancel();
        } catch {
            setError('Ошибка сети');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        setFile(null);
        setPreview(null);
        setError('');
        if (inputRef.current) inputRef.current.value = '';
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
            >
                <ImagePlus className="h-4 w-4" />
                Добавить фото
            </button>
        );
    }

    return (
        <div className="rounded-sm bg-white/10 backdrop-blur-sm p-5 space-y-4 max-w-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Добавить фото</h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div
                onClick={() => inputRef.current?.click()}
                className="relative flex h-48 cursor-pointer items-center justify-center rounded-sm border-2 border-dashed border-white/20 transition-colors hover:border-white/40 overflow-hidden"
            >
                {preview ? (
                    <Image src={preview} alt="preview" fill className="object-cover" />
                ) : (
                    <div className="text-center text-gray-400">
                        <ImagePlus className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">Нажмите для выбора</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP до 10MB</p>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2 font-bold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
                <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-2 text-white transition-all hover:bg-white/10"
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}
