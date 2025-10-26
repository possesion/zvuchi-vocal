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
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Заголовок и чекбокс */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Просмотр файла</h3>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isRead}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Ознакомлен</span>
                </label>
            </div>

            {/* Контент файла */}
            <div className="bg-white p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm max-h-96 overflow-y-auto">
                    {content}
                </pre>
            </div>
        </div>
    );
}
