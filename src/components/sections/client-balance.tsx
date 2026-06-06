'use client';

import { useEffect, useState, useMemo } from 'react';
import { getClientBalance, ClientBalanceData } from '@/app/actions/crm';
import { UserProfileElement } from '@/components/common/user-profile-element';
import { CustomAlert } from '@/components/common/alert';
import { Loader2 } from 'lucide-react';

interface ClientBalanceProps {
    phoneVerified: boolean;
}

interface BalanceField {
    title: string;
    value: string;
    visible: boolean;
}

// Утилиты форматирования
const formatters = {
    date: (dateString: string | null): string => {
        if (!dateString) return 'Не указано';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    },

    balance: (balance: number | null): string => {
        if (balance === null || balance === undefined) return 'Не указано';
        return `${balance.toLocaleString('ru-RU')} ₽`;
    },

    lessonCount: (count: number | null): string => {
        if (count === null || count === undefined) return 'Не указано';
        if (count === 0) return 'Нет доступных уроков';
        
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${count} уроков`;
        }
        if (lastDigit === 1) return `${count} урок`;
        if (lastDigit >= 2 && lastDigit <= 4) return `${count} урока`;
        
        return `${count} уроков`;
    },
};

export function ClientBalance({ phoneVerified }: ClientBalanceProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ClientBalanceData | null>(null);

    useEffect(() => {
        if (!phoneVerified) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const result = await getClientBalance();

            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.error || 'Неизвестная ошибка');
            }

            setLoading(false);
        };

        fetchData();
    }, [phoneVerified]);

    // Декларативное определение полей для отображения
    const balanceFields: BalanceField[] = useMemo(() => {
        if (!data) return [];
        return [
            {
                title: 'Баланс счёта',
                value: formatters.balance(data.balance),
                visible: true,
            },
            {
                title: 'Осталось уроков',
                value: formatters.lessonCount(data.lessonCount),
                visible: true,
            },
            {
                title: 'Оплачено занятий',
                value: data.paidCount || 'Не указано',
                visible: !!data.paidCount,
            },
            {
                title: 'Дата последнего урока',
                value: formatters.date(data.lastAttendDate),
                visible: !!data.lastAttendDate,
            },
            {
                title: 'Следующий урок',
                value: formatters.date(data.nextLessonDate),
                visible: !!data.nextLessonDate,
            },
        ].filter((field) => field.visible);
    }, [data]);

    // Проверка необходимости пополнения
    const needsRefill = useMemo(() => {
        return data && data.lessonCount === 0 && (data.balance ?? 0) <= 0;
    }, [data]);

    // Рендер состояний
    if (!phoneVerified) {
        return (
            <CustomAlert
                alertText="Для получения данных об абонементе подтвердите номер телефона"
                color="violet"
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="ml-3 text-white/70">Загрузка данных...</span>
            </div>
        );
    }

    if (error) {
        return <CustomAlert alertText={error} color="red" />;
    }

    if (!data) {
        return <CustomAlert alertText="Данные недоступны" color="gray" />;
    }

    return (
        <div className="space-y-4">
            {balanceFields.map((field) => (
                <UserProfileElement
                    key={field.title}
                    title={field.title}
                    value={field.value}
                />
            ))}

            {needsRefill && (
                <CustomAlert
                    alertText="У вас закончились уроки."
                    color="yellow"
                />
            )}
        </div>
    );
}
