'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card } from '@radix-ui/themes';
import { Copy, Check, Calculator } from 'lucide-react';

// Утилита для обработки числовых значений
const numberRegister = {
    valueAsNumber: true,
    setValueAs: (value: string) => value === '' ? 0 : Number(value),
};

interface Instructor {
    id: number;
    name: string;
}

interface SalaryCalculatorFormProps {
    instructors: Instructor[];
}

interface FormData {
    instructorId: string;
    // Ставки
    lessonRate60: number;
    lessonRate90: number;
    lessonRate120: number;
    lessonRateDuet: number;
    lessonRateChildren: number;
    trialRate: number;
    trialDayRate: number;
    // Аренда
    rentalRate30: number;
    rentalRate60: number;
    rentalRate90: number;
    rentalRate120: number;
    // Активность - аренда
    rental30Count: number;
    rental60Count: number;
    rental90Count: number;
    rental120Count: number;
    // Активность - уроки
    lessons30Count: number;
    lessons60Count: number;
    lessons90Count: number;
    lessons120Count: number;
    lessonsDuetCount: number;
    lessonsChildrenCount: number;
    // Пробные
    trialRegularCount: number;
    trialDayCount: number;
    // Доп. выплаты
    bonuses: number;
    presenceOnRecording: number;
}

const defaultValues: FormData = {
    instructorId: '',
    lessonRate60: 1000,
    lessonRate90: 1500,
    lessonRate120: 2000,
    lessonRateDuet: 1200,
    lessonRateChildren: 700,
    trialRate: 400,
    trialDayRate: 1000,
    rentalRate30: 200,
    rentalRate60: 400,
    rentalRate90: 600,
    rentalRate120: 800,
    rental30Count: 0,
    rental60Count: 0,
    rental90Count: 0,
    rental120Count: 0,
    lessons30Count: 0,
    lessons60Count: 0,
    lessons90Count: 0,
    lessons120Count: 0,
    lessonsDuetCount: 0,
    lessonsChildrenCount: 0,
    trialRegularCount: 0,
    trialDayCount: 0,
    bonuses: 0,
    presenceOnRecording: 0,
};

export function SalaryCalculatorForm({ instructors }: SalaryCalculatorFormProps) {
    const [result, setResult] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const { register, handleSubmit, watch } = useForm<FormData>({
        defaultValues,
        shouldUnregister: false,
    });

    const instructorId = watch('instructorId');
    const selectedInstructor = instructors.find(i => i.id === parseInt(instructorId));

    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    const calculate = (data: FormData): string => {
        const lines: string[] = [];
        
        // Заголовок
        lines.push('🎯 РАСЧЕТ ЗАРПЛАТЫ ПЕДАГОГА');
        lines.push('');
        lines.push(`👤 Педагог: ${selectedInstructor?.name || 'Не выбран'}`);
        lines.push('');
        
        // Ставки (показываем только ненулевые)
        const rates: string[] = [];
        if (data.lessonRate60 > 0) rates.push(`• Обычный урок: ${formatNumber(data.lessonRate60)} руб.`);
        if (data.trialRate > 0) rates.push(`• Пробный урок: ${formatNumber(data.trialRate)} руб.`);
        if (data.rentalRate60 > 0) rates.push(`• Аренда зала: ${formatNumber(data.rentalRate60)} руб.`);
        
        if (rates.length > 0) {
            lines.push('💰 Ставки:');
            lines.push(...rates);
            lines.push('');
        }
        
        lines.push('📊 АКТИВНОСТЬ:');
        lines.push('');
        
        // Аренда (только если есть хотя бы одна)
        const hasRental = data.rental30Count > 0 || data.rental60Count > 0 || 
                          data.rental90Count > 0 || data.rental120Count > 0;
        
        if (hasRental) {
            lines.push('🏢 Аренда класса:');
            if (data.rental30Count > 0) lines.push(`• 30 мин: ${data.rental30Count} раз`);
            if (data.rental60Count > 0) lines.push(`• 60 мин: ${data.rental60Count} раз`);
            if (data.rental90Count > 0) lines.push(`• 90 мин: ${data.rental90Count} раз`);
            if (data.rental120Count > 0) lines.push(`• 120 мин: ${data.rental120Count} раз`);
            lines.push('');
        }
        
        // Уроки (только если есть хотя бы один)
        const hasLessons = data.lessons30Count > 0 || data.lessons60Count > 0 || 
                           data.lessons90Count > 0 || data.lessons120Count > 0 || 
                           data.lessonsDuetCount > 0 || data.lessonsChildrenCount > 0;
        
        if (hasLessons) {
            lines.push('📚 Проведенные уроки:');
            if (data.lessons30Count > 0) lines.push(`• 30 мин: ${data.lessons30Count} урока`);
            if (data.lessons60Count > 0) lines.push(`• 60 мин: ${data.lessons60Count} уроков`);
            if (data.lessons90Count > 0) lines.push(`• 90 мин: ${data.lessons90Count} урок(ов)`);
            if (data.lessons120Count > 0) lines.push(`• 120 мин: ${data.lessons120Count} урок(ов)`);
            if (data.lessonsDuetCount > 0) lines.push(`• дуэт 60 мин: ${data.lessonsDuetCount} урок`);
            if (data.lessonsChildrenCount > 0) lines.push(`• детский 40 мин: ${data.lessonsChildrenCount} урок`);
            lines.push('');
        }
        
        // Пробные (только если есть)
        const hasTrials = data.trialRegularCount > 0 || data.trialDayCount > 0;
        
        if (hasTrials) {
            lines.push('🎓 Пробные занятия');
            if (data.trialRegularCount > 0) lines.push(`• Обычные: ${data.trialRegularCount} занятий`);
            if (data.trialDayCount > 0) lines.push(`• День-в-день: ${data.trialDayCount} занятия`);
            lines.push('');
        }
        
        // Доп. выплаты
        if (data.bonuses > 0 || data.presenceOnRecording > 0) {
            lines.push('Доп. выплаты:');
            if (data.presenceOnRecording > 0) lines.push(`• Присутствие на записи: ${formatNumber(data.presenceOnRecording)} руб.`);
            if (data.bonuses > 0) lines.push(`• Бонусы: ${formatNumber(data.bonuses)} руб.`);
            lines.push('');
        }
        
        // Расчёт
        lines.push('💵 РАСЧЕТ:');
        lines.push('');
        
        let totalIncome = 0;
        let totalRental = 0;
        
        // Уроки
        if (data.lessons60Count > 0) {
            const sum = data.lessons60Count * data.lessonRate60;
            lines.push(`Уроки (часовой): ${data.lessons60Count}*${formatNumber(data.lessonRate60)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        if (data.lessons90Count > 0) {
            const sum = data.lessons90Count * data.lessonRate90;
            lines.push(`Уроки (1.5 часа): ${data.lessons90Count}*${formatNumber(data.lessonRate90)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        if (data.lessons120Count > 0) {
            const sum = data.lessons120Count * data.lessonRate120;
            lines.push(`Уроки (2 часа): ${data.lessons120Count}*${formatNumber(data.lessonRate120)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        if (data.lessonsDuetCount > 0) {
            const sum = data.lessonsDuetCount * data.lessonRateDuet;
            lines.push(`Уроки (дуэт): ${data.lessonsDuetCount}*${formatNumber(data.lessonRateDuet)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }

        if (data.lessonsChildrenCount > 0) {
            const sum = data.lessonsChildrenCount * data.lessonRateChildren;
            lines.push(`Уроки (детский): ${data.lessonsChildrenCount}*${formatNumber(data.lessonRateChildren)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        if (data.lessons30Count > 0) {
            const rate30 = Math.round(data.lessonRate60 * 0.5);
            const sum = data.lessons30Count * rate30;
            lines.push(`Уроки (30 мин): ${data.lessons30Count}*${formatNumber(rate30)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        // Пробные
        if (data.trialRegularCount > 0) {
            const sum = data.trialRegularCount * data.trialRate;
            lines.push(`Пробные: ${data.trialRegularCount}*${formatNumber(data.trialRate)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        if (data.trialDayCount > 0) {
            const sum = data.trialDayCount * data.trialDayRate;
            lines.push(`Пробные (день-в-день): ${data.trialDayCount}*${formatNumber(data.trialDayRate)} = ${formatNumber(sum)}`);
            totalIncome += sum;
        }
        
        // Аренда
        if (data.rental60Count > 0) {
            const sum = data.rental60Count * data.rentalRate60;
            lines.push(`Аренда 60 мин: ${data.rental60Count} × ${formatNumber(data.rentalRate60)} = ${formatNumber(sum)}`);
            totalRental += sum;
        }
        
        if (data.rental90Count > 0) {
            const sum = data.rental90Count * data.rentalRate90;
            lines.push(`Аренда 90 мин: ${data.rental90Count} × ${formatNumber(data.rentalRate90)} = ${formatNumber(sum)}`);
            totalRental += sum;
        }
        
        if (data.rental120Count > 0) {
            const sum = data.rental120Count * data.rentalRate120;
            lines.push(`Аренда 120 мин: ${data.rental120Count} × ${formatNumber(data.rentalRate120)} = ${formatNumber(sum)}`);
            totalRental += sum;
        }
        
        if (data.rental30Count > 0) {
            const sum = data.rental30Count * data.rentalRate30;
            lines.push(`Аренда 30 мин: ${data.rental30Count} × ${formatNumber(data.rentalRate30)} = ${formatNumber(sum)}`);
            totalRental += sum;
        }
        
        // Доп. выплаты
        if (data.presenceOnRecording > 0) {
            lines.push(`Присутствие на записи = ${formatNumber(data.presenceOnRecording)}`);
            totalIncome += data.presenceOnRecording;
        }
        
        if (data.bonuses > 0) {
            lines.push(`Бонусы = ${formatNumber(data.bonuses)}`);
            totalIncome += data.bonuses;
        }
        
        lines.push('');
        lines.push('');
        
        // Итого
        const total = totalIncome - totalRental;
        
        // Формируем формулу
        const incomeItems: string[] = [];
        if (data.lessons60Count > 0) incomeItems.push(formatNumber(data.lessons60Count * data.lessonRate60));
        if (data.lessons90Count > 0) incomeItems.push(formatNumber(data.lessons90Count * data.lessonRate90));
        if (data.lessons120Count > 0) incomeItems.push(formatNumber(data.lessons120Count * data.lessonRate120));
        if (data.lessonsDuetCount > 0) incomeItems.push(formatNumber(data.lessonsDuetCount * data.lessonRateDuet));
        if (data.lessonsChildrenCount > 0) incomeItems.push(formatNumber(data.lessonsChildrenCount * data.lessonRateChildren));
        if (data.lessons30Count > 0) incomeItems.push(formatNumber(data.lessons30Count * Math.round(data.lessonRate60 * 0.5)));
        if (data.trialRegularCount > 0) incomeItems.push(formatNumber(data.trialRegularCount * data.trialRate));
        if (data.trialDayCount > 0) incomeItems.push(formatNumber(data.trialDayCount * data.trialDayRate));
        if (data.presenceOnRecording > 0) incomeItems.push(formatNumber(data.presenceOnRecording));
        if (data.bonuses > 0) incomeItems.push(formatNumber(data.bonuses));
        
        const rentalItems: string[] = [];
        if (data.rental60Count > 0) rentalItems.push(formatNumber(data.rental60Count * data.rentalRate60));
        if (data.rental90Count > 0) rentalItems.push(formatNumber(data.rental90Count * data.rentalRate90));
        if (data.rental120Count > 0) rentalItems.push(formatNumber(data.rental120Count * data.rentalRate120));
        if (data.rental30Count > 0) rentalItems.push(formatNumber(data.rental30Count * data.rentalRate30));
        
        let formula = '';
        if (incomeItems.length > 0 && rentalItems.length > 0) {
            formula = `${incomeItems.join('+')} - (${rentalItems.join('+')})`;
        } else if (incomeItems.length > 0) {
            formula = incomeItems.join('+');
        } else if (rentalItems.length > 0) {
            formula = `-(${rentalItems.join('+')})`;
        }
        
        lines.push(`💎 ИТОГО: ${formula} = ${formatNumber(total)} руб.`);
        
        return lines.join('\n');
    };

    const onSubmit = (data: FormData) => {
        const text = calculate(data);
        setResult(text);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const inputClass = 'w-full rounded-md bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-purple-500';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Выбор педагога */}
            <div className="space-y-2">
                <label className="text-sm text-gray-300">Педагог</label>
                <select
                    {...register('instructorId')}
                    className={inputClass}
                >
                    <option value="">Выберите педагога</option>
                    {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ставки */}
            <Card className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">💰 Ставки</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Урок 60 мин</label>
                        <input
                            type="number"
                            {...register('lessonRate60', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Урок 90 мин</label>
                        <input
                            type="number"
                            {...register('lessonRate90', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Урок 120 мин</label>
                        <input
                            type="number"
                            {...register('lessonRate120', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Дуэт 60 мин</label>
                        <input
                            type="number"
                            {...register('lessonRateDuet', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Детский урок 40 мин</label>
                        <input
                            type="number"
                            {...register('lessonRateChildren', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Пробный урок</label>
                        <input
                            type="number"
                            {...register('trialRate', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Пробный (день-в-день)</label>
                        <input
                            type="number"
                            {...register('trialDayRate', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Card>

            {/* Аренда класса */}
            <Card className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">🏢 Аренда класса</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Ставка 30 мин</label>
                        <input
                            type="number"
                            {...register('rentalRate30', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Ставка 60 мин</label>
                        <input
                            type="number"
                            {...register('rentalRate60', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Ставка 90 мин</label>
                        <input
                            type="number"
                            {...register('rentalRate90', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Ставка 120 мин</label>
                        <input
                            type="number"
                            {...register('rentalRate120', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Кол-во 30 мин</label>
                        <input
                            type="number"
                            {...register('rental30Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Кол-во 60 мин</label>
                        <input
                            type="number"
                            {...register('rental60Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Кол-во 90 мин</label>
                        <input
                            type="number"
                            {...register('rental90Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Кол-во 120 мин</label>
                        <input
                            type="number"
                            {...register('rental120Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Card>

            {/* Проведенные уроки */}
            <Card className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">📚 Проведенные уроки</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">30 мин</label>
                        <input
                            type="number"
                            {...register('lessons30Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">60 мин</label>
                        <input
                            type="number"
                            {...register('lessons60Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">90 мин</label>
                        <input
                            type="number"
                            {...register('lessons90Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">120 мин</label>
                        <input
                            type="number"
                            {...register('lessons120Count', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Дуэт 60 мин</label>
                        <input
                            type="number"
                            {...register('lessonsDuetCount', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Детский 40 мин</label>
                        <input
                            type="number"
                            {...register('lessonsChildrenCount', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Card>

            {/* Пробные занятия */}
            <Card className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">🎓 Пробные занятия</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Обычные</label>
                        <input
                            type="number"
                            {...register('trialRegularCount', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">День-в-день</label>
                        <input
                            type="number"
                            {...register('trialDayCount', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Card>

            {/* Дополнительные выплаты */}
            <Card className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">💵 Дополнительные выплаты</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Присутствие на записи</label>
                        <input
                            type="number"
                            {...register('presenceOnRecording', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Бонусы / Премии</label>
                        <input
                            type="number"
                            {...register('bonuses', numberRegister)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </Card>

            {/* Кнопка расчёта */}
            <Button
                type="submit"
                size="3"
                className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
            >
                <Calculator className="mr-2" />
                Рассчитать
            </Button>

            {/* Результат */}
            {result && (
                <Card className="mt-2 p-4 bg-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-white">Результат</h3>
                        <Button
                            type="button"
                            variant="soft"
                            onClick={handleCopy}
                            className="cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Скопировано
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Копировать
                                </>
                            )}
                        </Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono bg-zinc-900 p-4 rounded-md overflow-x-auto">
                        {result}
                    </pre>
                </Card>
            )}
        </form>
    );
}
