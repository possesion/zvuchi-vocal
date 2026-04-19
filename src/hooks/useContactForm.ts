'use client';

import { useState } from 'react';
import { formatPhoneNumber } from '@/lib/format';

export interface ContactFormData {
    name: string;
    phone: string;
}

export function useContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({ name: '', phone: '' });
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'phone' ? formatPhoneNumber(value) : value,
        }));
    };

    const handleValidate = (text: string) => (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.setCustomValidity(text);
    };

    const reset = () => {
        setFormData({ name: '', phone: '' });
        setIsAgreed(false);
    };

    return {
        formData,
        isAgreed,
        setIsAgreed,
        isSubmitting,
        setIsSubmitting,
        handleChange,
        handleValidate,
        reset,
    };
}
