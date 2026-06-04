'use client';

import { sendPhoneVerification, verifyPhoneCode } from "@/app/actions/phone"
import { useState } from "react";
import { Button, Dialog, Flex, TextField, VisuallyHidden } from "@radix-ui/themes";
import { VerifyPhoneCodeResult } from "@/app/actions/types";
import { VERIFY_TIMEOUT } from "../common/constants";

export const VerifyPhoneNumber = ({ phone }: { phone: string }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<VerifyPhoneCodeResult>();
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const handleSendCode = async (phoneNumber: string) =>{
       try {
         const result = await sendPhoneVerification(phoneNumber)
        setButtonDisabled(true);
         setVerificationResult(result)
       } catch (error) {
        if (error instanceof Error) {
            setVerificationResult({ success: false, error: error.message })
        } else {
            setVerificationResult({ success: false, error: 'неизвестная ошибка' })
        }
       } finally {
        setTimeout(() => {
            setButtonDisabled(false)
        }, VERIFY_TIMEOUT);
       }
    }

    const handleVerify = async () =>{
       try {
         const result = await verifyPhoneCode(verificationCode);
        setButtonDisabled(true);
         setVerificationResult(result)
       } catch (error) {
        if (error instanceof Error) {
            setVerificationResult({ success: false, error: error.message })
        } else {
            setVerificationResult({ success: false, error: 'неизвестная ошибка' })
        }
       } finally {
        setTimeout(() => {
            setButtonDisabled(false)
        }, VERIFY_TIMEOUT);
       }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                    type="submit"
                    onClick={() => handleSendCode(phone)}
                    size="2"
                    className="cursor-pointer flex items-center gap-2 rounded-sm bg-brand px-6 py-3 font-bold text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Подтвердить
                </Button>
            </Dialog.Trigger>
            <VisuallyHidden>
                <Dialog.Title className="mb-4 text-2xl font-bold">
                    Заголовок модального окна
                </Dialog.Title>
            </VisuallyHidden>
            <Dialog.Content maxWidth="450px">
                <Dialog.Title>Подтвердите номер телефона</Dialog.Title>
                <Dialog.Description size="2" mb="5">
                    Можно запрашивать код не чаще 1 раза в минуту
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <p className="mb-1 text-sm">
                            Код подтверждения из СМС
                        </p>
                        <TextField.Root
                            value={verificationCode}
                            onChange={({ target }) => {
                                setVerificationCode(target.value)
                            }}
                            maxLength={6} 
                            placeholder="Код"
                        />
                    </label>
                    <div className="h-6 text-red-800">
                        {verificationResult?.success === false && (
                        <p>{verificationResult.error}</p>
                    )}
                    </div>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Закрыть
                        </Button>
                    </Dialog.Close>
                    <Button variant="solid" disabled={buttonDisabled} onClick={() => sendPhoneVerification(phone)}>Запросить код повторно</Button>
                    <Button color='green' disabled={buttonDisabled || verificationCode.length !== 6} onClick={handleVerify}>Отправить</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}