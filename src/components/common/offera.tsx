import { FC, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import mammoth from 'mammoth';
import { PlatformDialog } from '../modals/platform-dialog';

interface OfferaProps {
    children: ReactNode;
    document: string;
    isOpen?: boolean;
}

export const Offera: FC<OfferaProps> = ({ children, document }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docIsLoaded, setDocIsLoaded] = useState(false);
    const [, setIsRead] = useState(false);
    const [isDocx, setIsDocx] = useState(false);
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string>('');

    const contentContainerRef = useRef<HTMLDivElement>(null);
    const endMarkerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Ленивая загрузка документа только при открытии модалки
    const loadDocument = useCallback(async () => {
        if (docIsLoaded || !document) return;

        try {
            // Отменяем предыдущий запрос, если он есть
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Создаем новый AbortController для отмены запроса
            abortControllerRef.current = new AbortController();

            const fileExtension = document.toLowerCase().split('.').pop();
            setDocIsLoaded(false);
            setError('');
            setIsRead(false);

            const response = await fetch(document, {
                signal: abortControllerRef.current.signal
            });

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
            // Игнорируем ошибки отмены запроса
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            setError(
                err instanceof Error ? err.message : 'Ошибка загрузки'
            );
        } finally {
            setDocIsLoaded(true);
            abortControllerRef.current = null;
        }
    }, [document, docIsLoaded]);

    // Загружаем документ только при открытии модалки
    useEffect(() => {
        if (isModalOpen && !docIsLoaded) {
            loadDocument();
        }
    }, [isModalOpen, docIsLoaded, loadDocument]);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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
            [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold
            [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold  
            [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold
            [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:list-disc
            [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:list-decimal
            [&_li]:my-1
            [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse
            [&_td]:border [&_td]:border-gray-300 [&_td]:p-2
            [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: content }}
        />)
            : (
                <pre className="whitespace-pre-wrap p-4 text-sm font-sans leading-6">
                    {content}
                </pre>
            )
    }

    return (
        <PlatformDialog
            className="w-[380px] sm:w-[440px] md:w-[600px] lg:w-[800px]"
            trigger={children}
            onOpen={setIsModalOpen}
        >

            <div className="relative flex h-full w-full flex-col">
                {/* Контент документа */}
                <div
                    ref={contentContainerRef}
                    className="max-h-[70vh] min-h-[200px] flex-1 overflow-auto rounded-lg border bg-gray-50"
                    onScroll={checkScrollPosition}
                >
                    {!docIsLoaded ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />
                            <span>Загрузка документа...</span>
                        </div>
                    ) : error ? (
                        <div className="flex h-32 items-center justify-center text-red-600">
                            ❌ {error}
                        </div>
                    ) : (
                        <div className="relative bg-white">
                            {renderContent()}
                            <div
                                ref={endMarkerRef}
                                className="h-1 opacity-0"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* <Dialog.Close asChild>
                            <button
                                className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                                aria-label="Закрыть диалог"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </Dialog.Close>      */}
        </PlatformDialog>
    );
};