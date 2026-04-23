'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Check, Trash2, Loader } from 'lucide-react';

export interface ImageUploadStrategy {
    upload: (file: File) => Promise<string>;
    remove?: () => Promise<void>;
    accept?: string;
    maxSizeMb?: number;
    label?: string;
}

interface ImageUploaderProps {
    strategy: ImageUploadStrategy;
    currentUrl?: string;
    onUploaded: (url: string) => void;
    onRemoved?: () => void;
    /** inline — встроенный режим (без кнопки открытия), panel — с кнопкой и заголовком */
    variant?: 'inline' | 'panel';
}

export function ImageUploader({
    strategy,
    currentUrl = '',
    onUploaded,
    onRemoved,
    variant = 'inline',
}: ImageUploaderProps) {
    const [isOpen, setIsOpen] = useState(variant === 'inline');
    const [preview, setPreview] = useState(currentUrl);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const accept = strategy.accept ?? 'image/jpeg,image/png,image/webp';
    const maxBytes = (strategy.maxSizeMb ?? 10) * 1024 * 1024;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > maxBytes) {
            setError(`Файл слишком большой (макс. ${strategy.maxSizeMb ?? 10}MB)`);
            return;
        }
        setError('');
        setPreview(URL.createObjectURL(file));
        // inline — загружаем сразу, panel — ждём подтверждения
        if (variant === 'inline') {
            uploadFile(file);
        } else {
            setPendingFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            const url = await strategy.upload(file);
            setPreview(url);
            onUploaded(url);
            setPendingFile(null);
        } catch {
            setError('Ошибка загрузки');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            await strategy.remove?.();
            setPreview('');
            onRemoved?.();
        } catch {
            setError('Ошибка удаления');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        setPendingFile(null);
        setPreview(currentUrl);
        setError('');
        if (inputRef.current) inputRef.current.value = '';
    };

    // Panel variant — кнопка открытия
    if (variant === 'panel' && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
            >
                <ImagePlus className="h-4 w-4" />
                {strategy.label ?? 'Добавить фото'}
            </button>
        );
    }

    const dropZone = (
        <div
            onClick={() => !uploading && inputRef.current?.click()}
            className="relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-white/20 transition-colors hover:border-white/40"
        >
            {preview ? (
                <Image src={preview} alt="preview" fill className="object-cover" />
            ) : (
                <div className="text-center text-gray-400">
                    <ImagePlus className="mx-auto mb-1 h-6 w-6" />
                    <p className="text-xs">JPG, PNG, WebP до {strategy.maxSizeMb ?? 10}MB</p>
                </div>
            )}
            {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader className="h-6 w-6 animate-spin text-white" />
                </div>
            )}
        </div>
    );

    // Inline variant
    if (variant === 'inline') {
        return (
            <div className="space-y-2">
                {strategy.label && <label className="text-sm text-gray-300">{strategy.label}</label>}
                {dropZone}
                <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
                {error && <p className="text-xs text-red-400">{error}</p>}
                {preview && !uploading && strategy.remove && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="inline-flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-300"
                    >
                        <Trash2 className="h-3 w-3" /> Удалить
                    </button>
                )}
            </div>
        );
    }

    // Panel variant
    return (
        <div className="rounded-sm bg-white/10 backdrop-blur-sm p-5 space-y-4 max-w-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">{strategy.label ?? 'Добавить фото'}</h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
            {dropZone}
            <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
                <button
                    onClick={() => pendingFile && uploadFile(pendingFile)}
                    disabled={!pendingFile || uploading}
                    className="inline-flex items-center gap-2 rounded-sm bg-brand px-5 py-2 font-bold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
                <button onClick={handleCancel} className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-5 py-2 text-white transition-all hover:bg-white/10">
                    Отмена
                </button>
            </div>
        </div>
    );
}
