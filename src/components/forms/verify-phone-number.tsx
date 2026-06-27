'use client';

import { useState, useEffect, useCallback } from "react";
import { Button, Dialog, Flex, TextField, VisuallyHidden } from "@radix-ui/themes";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useMobileID } from "@/hooks/useMobileID";

type VerificationStatus = 'idle' | 'entering_phone' | 'entering_otp' | 'verifying' | 'success' | 'error';

interface VerifyPhoneNumberProps {
    phone: string;
    verificationDisabled: boolean;
}

export const VerifyPhoneNumber = ({ verificationDisabled, phone }: VerifyPhoneNumberProps) => {
    const [inputPhone, setInputPhone] = useState(phone);
    const [otpCode, setOtpCode] = useState('');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [message, setMessage] = useState<string>('');
    
    const {
        state: mobileIdState,
        sessionId,
        isInitialized,
        error: mobileIdError,
        init,
        start,
        submitOTP,
        destroy,
        onVerified,
        onRejected,
        onExpired,
        onInvalidCode,
        onError,
    } = useMobileID();

    // Инициализация при открытии диалога
    const handleOpenDialog = useCallback(async () => {
        setStatus('entering_phone');
        setMessage('');
        setOtpCode('');
        await init();
    }, [init]);

    // Регистрация обработчиков событий
    useEffect(() => {
        onVerified(async (verifyToken) => {
            if (!sessionId) return;
            
            setStatus('verifying');
            setMessage('Проверка верификации...');
            
            try {
                const res = await fetch('/api/mobileid/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: sessionId,
                        verify_token: verifyToken,
                    }),
                });
                
                const result = await res.json();
                
                if (result.success) {
                    setStatus('success');
                    setMessage('Номер телефона успешно подтверждён!');
                } else {
                    setStatus('error');
                    setMessage(result.error || 'Ошибка верификации');
                }
            } catch {
                setStatus('error');
                setMessage('Ошибка при проверке верификации');
            }
        });
        
        onRejected(() => {
            setStatus('error');
            setMessage('Верификация отклонена');
        });
        
        onExpired(() => {
            setStatus('error');
            setMessage('Время верификации истекло. Попробуйте снова');
        });
        
        onInvalidCode((msg) => {
            setMessage(msg || 'Неверный код');
            setOtpCode('');
        });
        
        onError((err) => {
            setStatus('error');
            setMessage(err.message || 'Произошла ошибка');
        });
    }, [sessionId, onVerified, onRejected, onExpired, onInvalidCode, onError]);

    // Запуск верификации
    const handleStartVerification = async () => {
        if (!isInitialized) {
            setMessage('Инициализация...');
            await init();
        }
        
        setStatus('entering_phone');
        setMessage('');
        
        // Нормализация номера (убираем всё кроме цифр и +)
        const normalizedPhone = inputPhone.replace(/[^\d+]/g, '');
        
        try {
            await start(normalizedPhone);
        } catch {
            setStatus('error');
            setMessage('Ошибка при запуске верификации');
        }
    };

    // Отправка OTP кода
    const handleSubmitOTP = async () => {
        if (otpCode.length < 4) {
            setMessage('Введите код полностью');
            return;
        }
        
        setMessage('');
        await submitOTP(otpCode);
    };

    // Перезапуск верификации
    const handleRetry = async () => {
        setStatus('idle');
        setMessage('');
        setOtpCode('');
        destroy();
        await init();
    };

    // Автоматический переход к вводу OTP при готовности
    useEffect(() => {
        if (mobileIdState === 'otp') {
            setStatus('entering_otp');
        }
    }, [mobileIdState]);

    // Отображение ошибок SDK
    useEffect(() => {
        if (mobileIdError) {
            setMessage(mobileIdError.message);
        }
    }, [mobileIdError]);

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                    disabled={verificationDisabled}
                    type="button"
                    size="2"
                    className="cursor-pointer flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleOpenDialog}
                >
                    Подтвердить
                </Button>
            </Dialog.Trigger>
            <VisuallyHidden>
                <Dialog.Title className="mb-4 text-2xl font-bold">
                    
                </Dialog.Title>
            </VisuallyHidden>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Подтвердите номер телефона</Dialog.Title>
                
                <Flex direction="column" gap="4" mt="4">
                    {/* Состояние ввода телефона */}
                    {(status === 'idle' || status === 'entering_phone') && mobileIdState !== 'otp' && (
                        <>
                            <Dialog.Description size="2">
                                Введите номер телефона для верификации
                            </Dialog.Description>
                            
                            <label>
                                <p className="mb-1 text-sm">
                                    Номер телефона
                                </p>
                                <TextField.Root
                                    onChange={({ target }) => setInputPhone(target.value)}
                                    placeholder="+7 999 123-45-67"
                                    value={inputPhone}
                                    disabled={mobileIdState === 'pending'}
                                />
                            </label>
                            
                            <Button
                                color="blue"
                                disabled={!inputPhone || mobileIdState === 'pending'}
                                onClick={handleStartVerification}
                            >
                                {mobileIdState === 'pending' ? (
                                    <>
                                        <RefreshCw className="animate-spin" />
                                        Отправка...
                                    </>
                                ) : (
                                    'Отправить код'
                                )}
                            </Button>
                        </>
                    )}
                    
                    {/* Состояние ввода OTP */}
                    {status === 'entering_otp' && (
                        <>
                            <Dialog.Description size="2">
                                На номер <strong>{inputPhone}</strong> отправлен код подтверждения
                            </Dialog.Description>
                            
                            <label>
                                <p className="mb-1 text-sm">
                                    Код из SMS
                                </p>
                                <TextField.Root
                                    onChange={({ target }) => {
                                        setOtpCode(target.value.replace(/\D/g, ''));
                                        setMessage('');
                                    }}
                                    maxLength={6}
                                    placeholder="Введите код"
                                    value={otpCode}
                                />
                            </label>
                            
                            <Flex gap="3">
                                <Button
                                    color="green"
                                    disabled={otpCode.length < 4}
                                    onClick={handleSubmitOTP}
                                >
                                    Подтвердить
                                </Button>
                                
                                <Button
                                    variant="soft"
                                    onClick={handleRetry}
                                >
                                    Отменить
                                </Button>
                            </Flex>
                        </>
                    )}
                    
                    {/* Состояние верификации */}
                    {status === 'verifying' && (
                        <Flex direction="column" align="center" gap="3">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm">{message}</p>
                        </Flex>
                    )}
                    
                    {/* Состояние успеха */}
                    {status === 'success' && (
                        <Flex direction="column" align="center" gap="3">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <p className="text-sm text-green-600">{message}</p>
                            <Dialog.Close>
                                <Button color="green">Закрыть</Button>
                            </Dialog.Close>
                        </Flex>
                    )}
                    
                    {/* Состояние ошибки */}
                    {status === 'error' && (
                        <Flex direction="column" align="center" gap="3">
                            <XCircle className="h-12 w-12 text-red-500" />
                            <p className="text-sm text-red-600">{message}</p>
                            <Button onClick={handleRetry}>
                                Попробовать снова
                            </Button>
                        </Flex>
                    )}
                    
                    {/* Сообщения об ошибках */}
                    {message && status !== 'success' && status !== 'error' && status !== 'verifying' && (
                        <div className="flex items-start gap-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{message}</p>
                        </div>
                    )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Закрыть
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
