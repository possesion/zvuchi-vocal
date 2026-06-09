'use client';

import { useEffect, useState, useMemo } from 'react';
import { getClientBalance, ClientBalanceData } from '@/app/actions/crm';
import { UserProfileElement } from '@/components/common/user-profile-element';
import { CustomAlert } from '@/components/common/alert';
import { Loader2 } from 'lucide-react';
import { formatDateTime, formatBalance, formatLessonCount } from '@/lib/format';

interface ClientBalanceProps {
    phoneVerified: boolean;
}

interface BalanceField {
    title: string;
    value: string;
    visible: boolean;
}


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

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error ?? 'Неизвестная ошибка');
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
                value: formatBalance(data.balance),
                visible: true,
            },
            {
                title: 'Осталось уроков',
                value: formatLessonCount(data.lessonCount),
                visible: true,
            },
            {
                title: 'Оплачено занятий',
                value: data.paidCount || 'Не указано',
                visible: !!data.paidCount,
            },
            {
                title: 'Дата последнего урока',
                value: data.lastAttendDate ?? 'Не указано',
                visible: !!data.lastAttendDate,
            },
            {
                title: 'Следующий урок',
                value: formatDateTime(data.nextLessonDate),
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
