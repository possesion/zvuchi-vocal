import { useEffect, useRef, useState } from 'react';

export const useSlideUpAnimation = (options = {}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.1,
                ...options
            }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options]);

    return {
        ref,
        isVisible,
        animationClass: isVisible
            ? 'transform translate-y-0 opacity-100 transition-all duration-700 ease-out'
            : 'transform translate-y-full opacity-0'
    };
};
