'use client'

import { useEffect, useState } from 'react'
import { Form } from 'radix-ui'
import { Button } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { PaymentSchema, type PaymentForm } from '@/lib/definitions'

// interface PaymentData {
//     amount: string
//     paymentMode: string[]
//     purpose: string
//     redirectUrl: string
//     customerCode?: string
//     preAuthorization: boolean
//     ttl: number
// }

// 'amount', 'purpose', 'client-name', 'email', 'items-name',

export default function PaymentForm() {
    const [isProcessing, setIsProcessing] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PaymentForm>({ resolver: yupResolver(PaymentSchema) })
    const onSubmit = async (data: PaymentForm) => {
        setIsProcessing(true)

        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOCHKA_TOKEN}`,
                },
                body: JSON.stringify({
                    Data: {
                        ...data,
                        Items: [
                            {
                                name: data.purpose,
                                amount: data.amount,
                                quantity: 1,
                                paymentObject: 'service',
                            },
                        ],
                        // redirectUrl:
                        //     process.env.NEXT_PUBLIC_TOCHKA_REDIRECT_URL,
                        preAuthorization: false,
                        paymentMode: ['sbp', 'card'],
                        purpose: 'Перевод за оказанные услуги',
                        ttl: 60,
                        customerCode:
                            process.env.NEXT_PUBLIC_TOCHKA_CUSTOMER_CODE,
                    },
                }),
            })

            const result = await response.json()
            if (response.ok) {
                // Перенаправление на страницу подтверждения или обработка дальнейших действий
                window?.open(result.Data.paymentLink, '_blank')
            } else {
                console.error(`Ошибка: ${result.error || 'Неизвестная ошибка'}`)
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error('Ошибка сети или сервера' + e.message)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    useEffect(() => {
    
        (async () => {
            const accessStatusResponse = await fetch(
                '/api/access-token-status',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Сделать мидл вару для авторизации
                        Authorization: `Bearer ${process.env.TOCHKA_API_KEY}`,
                    },
                }
            )
            console.log('RESP ', await accessStatusResponse.json())
        })()
    }, [])

    return (
        <Form.Root
            className="flex flex-col gap-y-3"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Form.Field name="amount">
                <Form.Label>Сумма (руб.)</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        placeholder="12800"
                        type="number"
                        {...register('amount')}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.amount?.message ?? ''}
                </div>
            </Form.Field>

            <Form.Field name="purpose">
                <Form.Label>Назначение платежа</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        placeholder="Оплата за абонемент на 4 занятия"
                        {...register('purpose')}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.purpose?.message ?? ''}
                </div>
            </Form.Field>

            <Form.Field name="client-name">
                <Form.Label>Ваше ФИО</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        placeholder="Иванов Иван Иванович"
                        {...register('Client.name')}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.Client?.name?.message ?? ''}
                </div>
            </Form.Field>

            <Form.Field name="client-email">
                <Form.Label>Ваша почта</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        type="email"
                        placeholder="example@email.com"
                        {...register('Client.email')}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.Client?.email?.message ?? ''}
                </div>
            </Form.Field>

            <Form.Submit asChild>
                <Button
                    className="p-2! mt-8! ml-auto rounded-sm!"
                    color="indigo"
                    variant="soft"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Обработка...' : 'Выбрать форму оплаты'}
                </Button>
            </Form.Submit>
        </Form.Root>
    )
}
