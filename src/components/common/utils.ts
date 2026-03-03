export const formatPhoneNumber = (value: string) => {
        // Удаляем все символы кроме цифр
        const phoneNumber = value.replace(/\D/g, '');
        
        // Если номер начинается с 8, заменяем на 7
        const normalizedNumber = phoneNumber.startsWith('8') 
            ? '7' + phoneNumber.slice(1) 
            : phoneNumber;
        
        // Применяем маску +7 (XXX) XXX-XX-XX
        if (normalizedNumber.length === 0) return '';
        if (normalizedNumber.length <= 1) return `+${normalizedNumber}`;
        if (normalizedNumber.length <= 4) return `+7 (${normalizedNumber.slice(1)}`;
        if (normalizedNumber.length <= 7) return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4)}`;
        if (normalizedNumber.length <= 9) return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4, 7)}-${normalizedNumber.slice(7)}`;
        return `+7 (${normalizedNumber.slice(1, 4)}) ${normalizedNumber.slice(4, 7)}-${normalizedNumber.slice(7, 9)}-${normalizedNumber.slice(9, 11)}`;
    };