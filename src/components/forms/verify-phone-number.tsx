'use client';

import { useState } from "react";
import { sendPhoneVerification, verifyPhoneCode } from "@/app/actions/phone"
import { Button, Dialog, Flex, TextField, VisuallyHidden } from "@radix-ui/themes";
import { VerifyPhoneCodeResult } from "@/app/actions/types";
import { VERIFY_TIMEOUT } from "../common/constants";
import { RefreshCw, Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

export const VerifyPhoneNumber = ({ verificationDisabled, phone }: { phone: string, verificationDisabled: boolean }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<VerifyPhoneCodeResult>();
    const [isVerifying, setIsVerifying] = useState(false);

    const { seconds: secondsLeft, start: startCountdown } = useCountdown(VERIFY_TIMEOUT / 1000, false);

    const handleSendCode = async (phoneNumber: string) => {
        try {
            setIsVerifying(true);
            const result = await sendPhoneVerification(phoneNumber);
            setVerificationResult(result);
            if (result.success) {
                // Запускаем таймер заново при каждой отправке кода
                startCountdown();
            } else {
                console.log('[SMS Aero] Ошибка: ', result);
            }
        } catch {
            setVerificationResult({ success: false, error: 'Ошибка при отправке кода' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerify = async () => {
        try {
            setIsVerifying(true);
            const result = await verifyPhoneCode(verificationCode);
            setVerificationResult(result);
            if (result.success) {
                setVerificationCode('');
            } else {
                console.log('[SMS Aero] Ошибка: ', result);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log('[SMS Aero] Ошибка: ', error);
            }
            setVerificationResult({ success: false, error: 'отправка кода недоступна' });
        } finally {
            setIsVerifying(false);
        }
    };

    const canResend = secondsLeft === 0;

    return (
            <Dialog.Root>
                <Dialog.Trigger>
                    <Button
                        disabled={verificationDisabled}
                        type="button"
                        size="2"
                        className="cursor-pointer flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                            handleSendCode(phone)
                        }}
                    >
                        Подтвердить
                    </Button>
                </Dialog.Trigger>
                <VisuallyHidden>
                    <Dialog.Title className="mb-4 text-2xl font-bold">
                        Подтверждение номера телефона
                    </Dialog.Title>
                </VisuallyHidden>
                <Dialog.Content maxWidth="450px">
                    <Dialog.Title>Подтвердите номер телефона</Dialog.Title>
                    <Dialog.Description size="2" mb="5">
                        Отправлен код на номер <strong>{phone}</strong>
                    </Dialog.Description>

                    <Flex direction="column" gap="3" px='4'>
                        <label>
                            <p className="mb-1 text-sm">
                                Код подтверждения из СМС
                            </p>
                            <TextField.Root
                                onChange={({ target }) => {
                                    setVerificationCode(target.value.replace(/\D/g, ''))
                                }}
                                maxLength={6}
                                placeholder="Введите 6-значный код"
                                value={verificationCode}
                            />
                        </label>
                        <div className="min-h-6">
                            {verificationResult?.success === false && (
                                <p className="text-sm text-red-500">Ошибка при отправке кода</p>
                            )}
                            {verificationResult?.success === true && (
                                <p className="text-sm text-green-500">Номер успешно подтверждён!</p>
                            )}
                        </div>

                        {/* Информация о таймере */}
                        <div className="h-5 flex items-center justify-center gap-2 text-sm text-gray-500">
                            {!canResend && (
                                <>
                                    <Clock className="h-4 w-4" />
                                    <span>Повторить через {secondsLeft}с</span>
                                </>
                            )}
                        </div>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">
                                Закрыть
                            </Button>
                        </Dialog.Close>

                        <Button
                            variant="solid"
                            disabled={!canResend || isVerifying}
                            onClick={() => handleSendCode(phone)}
                        >
                            <RefreshCw className={isVerifying ? 'animate-spin' : ''} />
                            <span className="hidden md:inline">
                                {canResend ? 'Запросить код' : `Подождите ${secondsLeft}с`}
                            </span>
                        </Button>

                        <Button
                            color="green"
                            disabled={isVerifying || verificationCode.length !== 6}
                            onClick={handleVerify}
                        >
                            {isVerifying ? 'Проверка...' : 'Подтвердить'}
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
    );
};
