import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { PlatformDialog } from '../modals/platform-dialog';
import { FC, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import mammoth from 'mammoth';

interface OfferaProps {
    children: ReactNode;
    document: string;
    isOpen?: boolean;
}

export const Offera: FC<OfferaProps> = ({ children, document }) => {
    const [docIsLoaded, setDocIsLoaded] = useState(false);
    const [, setIsRead] = useState(false);
    const [isDocx, setIsDocx] = useState(false);
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string>('');

    const contentContainerRef = useRef<HTMLDivElement>(null);
    const endMarkerRef = useRef<HTMLDivElement>(null);

    // Загрузка документа
    useEffect(() => {
        const loadTextFile = async () => {
            try {
                const fileExtension = document.toLowerCase().split('.').pop();
                setDocIsLoaded(false);
                setError('');
                setIsRead(false);

                const response = await fetch(document);
                if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

                if (fileExtension === 'docx') {
                    setIsDocx(true);
                    const arrayBuffer = await response.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setContent(result.value);
                } else {
                    setIsDocx(false);
                    const text = await response.text();
                    setContent(text);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Ошибка загрузки'
                );
            } finally {
                setDocIsLoaded(true);
            }
        };

        if (document) loadTextFile();
    }, [document]);

    // Функция для принудительной проверки (для отладки)
    const checkScrollPosition = useCallback(() => {
        if (!contentContainerRef.current || !endMarkerRef.current) return;
        const container = contentContainerRef.current;

        const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;

        if (isAtBottom) {
            setIsRead(true);
            localStorage.setItem('privacy-agreement', 'true');
        }
    }, []);

    // Проверяем скролл при изменении размера контента
    useEffect(() => {
        if (!docIsLoaded || !content) return;

        const timeoutId = setTimeout(() => {
            checkScrollPosition();
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [docIsLoaded, content, checkScrollPosition]);

    const renderContent = () => {
        return isDocx ? (<div
            className="bg-white p-6
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3  
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
            [&_li]:my-1
            [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse
            [&_td]:border [&_td]:border-gray-300 [&_td]:p-2
            [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100"
            dangerouslySetInnerHTML={{ __html: content }}
        />)
            : (
                <pre className="whitespace-pre-wrap font-sans text-sm p-4 leading-6">
                    {content}
                </pre>
            )
    }

    return (
        <PlatformDialog
            className="w-[380px] sm:w-[440px] md:w-[600px] lg:w-[800px]"
            trigger={children}
        >
            <VisuallyHidden>
                <Dialog.Title className="text-2xl font-bold mb-4">
                    Просмотр документа
                </Dialog.Title>
            </VisuallyHidden>

            <div className="relative h-full w-full flex flex-col">
                {/* Контент документа */}
                <div
                    ref={contentContainerRef}
                    className="flex-1 overflow-auto border rounded-lg bg-gray-50 min-h-[200px] max-h-[70vh]"
                    onScroll={checkScrollPosition}
                >
                    {!docIsLoaded ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                            <span>Загрузка документа...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-32 text-red-600">
                            ❌ {error}
                        </div>
                    ) : (
                        <div className="bg-white relative">
                            {renderContent()}
                            <div
                                ref={endMarkerRef}
                                className="h-1 opacity-0"
                            />
                        </div>
                    )}
                </div>
            </div>
        </PlatformDialog>
    );
};