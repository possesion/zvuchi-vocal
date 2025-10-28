'use client';

import { useState, useEffect } from 'react';

interface TextFilePreviewProps {
    fileUrl: string;
    onReadChange?: (isRead: boolean) => void;
}

export default function TextPreview({
    fileUrl,
    onReadChange,
}: TextFilePreviewProps) {
    const [content, setContent] = useState<string>('');
    const [isRead, setIsRead] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Загрузка содержимого файла
    useEffect(() => {
        const fetchFileContent = async () => {
            try {
                setLoading(true);
                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error('Файл не найден');
                }

                const text = await response.text();
                setContent(text);
            } catch (err) {
                setError('Ошибка загрузки файла');
                console.error('Error loading file:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFileContent();
    }, [fileUrl]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsRead(checked);
        onReadChange?.(checked);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8" role="status" aria-label="Загрузка файла">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="sr-only">Загрузка...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            {/* Заголовок и чекбокс */}
            <header className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                <h3 className="font-medium">Просмотр файла</h3>
                <label className="flex cursor-pointer items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isRead}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Ознакомлен</span>
                </label>
            </header>

            {/* Контент файла */}
            <div className="bg-white p-4">
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm font-sans">
                    {content}
                </pre>
            </div>
        </div>
    );
}
