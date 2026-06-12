import { useRef, useState, useEffect } from "react";

export function LazyIframe({ src, title }: { src: string; title: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="w-full h-full">
            {isVisible && (
                <iframe
                    src={src}
                    className="w-full h-full rounded-sm border-none"
                    allow="clipboard-write"
                    allowFullScreen
                    title={title}
                />
            )}
        </div>
    );
}