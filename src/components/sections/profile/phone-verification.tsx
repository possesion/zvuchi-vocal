'use client';

import { VerifyPhoneNumber } from "@/components/forms/verify-phone-number"
import { CheckCircle } from "lucide-react"
import { FC, useState } from "react"

interface PhoneVerificationProps {
    phoneVerified: number;
    phone: string;
}

export const PhoneVerification: FC<PhoneVerificationProps> = ({ phone, phoneVerified }) => {
    const [isApproved, setIsApproved] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <span className="text-white/70">Телефон подтверждён:</span>
                {phoneVerified === 1 ? (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Да</span>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center gap-2 text-yellow-400">
                        <VerifyPhoneNumber phone={phone} verificationDisabled={!isApproved} />
                    </div>
                )}
            </div>
            {phoneVerified !== 1
                ? (<div className="flex justify-end items-center gap-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={isApproved}
                        onChange={() => setIsApproved((prev) => !prev)}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-800 accent-purple-500"
                    />
                    <label htmlFor="rememberMe" className="cursor-pointer select-none text-sm text-white/70">
                        Согласие на получение СМС-уведомлений
                    </label>
                </div>) : null}
        </>
    )
}