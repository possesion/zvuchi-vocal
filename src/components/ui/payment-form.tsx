'use client'

import { useState } from 'react'
import { Form } from 'radix-ui'
import { Button } from '@radix-ui/themes'
import { SubmitHandler, useForm } from 'react-hook-form'

// interface PaymentData {
//     amount: string
//     paymentMode: string[]
//     purpose: string
//     redirectUrl: string
//     customerCode?: string
//     preAuthorization: boolean
//     ttl: number
// }

type Inputs = {
    amount: number
    purpose: string
}

export default function PaymentForm() {
    const [isProcessing, setIsProcessing] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>()
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
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
                        redirectUrl:
                            process.env.NEXT_PUBLIC_TOCHKA_REDIRECT_URL,
                        preAuthorization: false,
                        paymentMode: ['sbp', 'card'],
                        ttl: 10080,
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

    // useEffect(() => {
    //     ;(async () => {
    //         await fetch('/api/operation-list', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${process.env.TOCHKA_API_KEY}`,
    //             },
    //         })
    //     })()
    // }, [])

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
                        defaultValue={1000}
                        {...register('amount', { required: true })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600">
                    {errors.amount && 'Обязательное поле'}
                </div>
            </Form.Field>

            <Form.Field name="purpose">
                <Form.Label>Назначение платежа</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        {...register('purpose', { required: true })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600">
                    {errors.purpose && 'Обязательное поле'}
                </div>
            </Form.Field>

            <Form.Submit asChild>
                <Button
                    className="!p-2 !mt-8 ml-auto !rounded-md"
                    color="indigo"
                    variant="soft"
                >
                    {isProcessing ? 'Обработка...' : 'Выбрать форму оплаты'}
                </Button>
            </Form.Submit>
        </Form.Root>
    )
}
