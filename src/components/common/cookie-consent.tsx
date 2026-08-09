'use client';

import { useState, useEffect } from 'react';
import { Offera } from '@/components/common/offera';

const CONSENT_COOKIE_NAME = 'cookie-consent-given';
const CONSENT_COOKIE_DAYS = 180;

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = getCookie(CONSENT_COOKIE_NAME);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAgree = () => {
        setCookie(CONSENT_COOKIE_NAME, 'true', CONSENT_COOKIE_DAYS);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900/95 backdrop-blur-sm border-t border-white/10 shadow-lg">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-white/80 text-center sm:text-left">
                   Мы используем файлы cookie для обеспечения работоспособности и улучшения качества обслуживания. Продолжая использовать наш сайт, вы автоматически соглашаетесь с использованием данных технологий
                </p>
                <div className="flex gap-3 shrink-0">
                    <Offera document="/documents/privacy.txt">
                        <button className="px-4 py-2 text-sm font-medium text-white rounded-sm outline outline-1 outline-white/30 hover:outline-white/60 hover:bg-white/5 transition-colors">
                            Политика конфиденциальности
                        </button>
                    </Offera>
                    <button
                        onClick={handleAgree}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-sm hover:bg-purple-700 transition-colors"
                    >
                        Согласиться
                    </button>
                </div>
            </div>
        </div>
    );
}
