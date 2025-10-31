import { useEffect } from "react";

export const useBlockScroll = (isModalOpen: boolean) => {
    useEffect(() => {
        let scrollY = 0;

        if (isModalOpen) {
            // Сохраняем позицию скролла
            scrollY = window.scrollY;

            // Добавляем класс и блокируем скролл
            document.body.classList.add('modal-open');
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else if (!isModalOpen && document.body.style.position === 'fixed') {
            // Восстанавливаем скролл только если модалка была открыта
            const scrollTop = parseInt(document.body.style.top || '0', 10);

            document.body.classList.remove('modal-open');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // Используем requestAnimationFrame для плавного восстановления
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: Math.abs(scrollTop),
                    behavior: 'instant'
                });
            });
        }
    }, [isModalOpen]);
}