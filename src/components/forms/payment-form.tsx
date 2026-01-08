'use client'

import { useEffect, useState } from 'react'
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

// 'amount', 'purpose', 'client-name', 'email', 'items-name',

// "Data": {
//     "customerCode": {{customerCode}},
//     "amount": "",
//       "purpose": "",
//       "paymentMode": [],
//       "taxSystemCode": "usn_income",
//       "Client": {
//         "name": "",
//           "email": "",
//     },
//     "Items": [
//         {
//             "name": "",
//             "amount": "",
//             "quantity": 1,
//             "paymentObject": "service",
//         }
//     ],
//       "preAuthorization": false,
//       "ttl": 60
// }

type Inputs = {
    amount: number
    purpose: string
    Client: {
        name: string
        email: string
    }
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
                        {...register('amount', { required: true })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.amount && 'Обязательное поле'}
                </div>
            </Form.Field>

            <Form.Field name="purpose">
                <Form.Label>Назначение платежа</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        placeholder="Оплата за абонемент на 4 занятия"
                        {...register('purpose', { required: true })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.purpose && 'Обязательное поле'}
                </div>
            </Form.Field>

            <Form.Field name="client-name">
                <Form.Label>Ваше ФИО</Form.Label>
                <Form.Control asChild>
                    <input
                        className="Input"
                        defaultValue=""
                        placeholder="Иванов Иван Иванович"
                        {...register('Client.name', { required: true })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.Client?.name && 'Обязательное поле'}
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
                        {...register('Client.email', {
                            required: true,
                            pattern:
                                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        })}
                    />
                </Form.Control>
                <div className="h-4 text-red-600" role="alert">
                    {errors.Client?.email && 'Обязательное поле'}
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
