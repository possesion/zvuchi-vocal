/**
 * SMS Aero API client
 * Документация: https://smsaero.ru/integration/documentation/api/
 */

const SMS_AERO_EMAIL = process.env.SMS_AERO_EMAIL;
const SMS_AERO_API_KEY = process.env.SMS_AERO_API_KEY;
const SMS_AERO_API_URL = 'https://gate.smsaero.ru/v2';

interface SendSmsResponse {
    success: boolean;
    data?: {
        id: number;
        from: string;
        number: string;
        text: string;
        status: number;
        extendStatus: string;
        channel: string;
        cost: number;
        dateCreate: number;
        dateSend: number;
    };
    message?: string;
}

/**
 * Отправка SMS через SMS Aero
 * @param phone - номер телефона в международном формате (например: +79991234567)
 * @param text - текст сообщения
 */
export async function sendSms(phone: string, text: string): Promise<SendSmsResponse> {
    if (!SMS_AERO_EMAIL || !SMS_AERO_API_KEY) {
        console.error('SMS_AERO_EMAIL or SMS_AERO_API_KEY not configured');
        return { success: false, message: 'SMS service not configured' };
    }

    try {
        // Убираем + из номера для API
        const cleanPhone = phone.replace(/\+/g, '');

        // SMS Aero использует Basic Authentication: email:api_key
        const authString = Buffer.from(`${SMS_AERO_EMAIL}:${SMS_AERO_API_KEY}`).toString('base64');

        const response = await fetch(`${SMS_AERO_API_URL}/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`,
            },
            body: JSON.stringify({
                number: cleanPhone,
                text: text,
                sign: 'SMS Aero', // Можно заменить на вашу подпись
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('SMS Aero API error:', data);
            return {
                success: false,
                message: data.message || 'Failed to send SMS',
            };
        }

        return {
            success: true,
            data: data.data,
        };
    } catch (error) {
        console.error('SMS sending error:', error);
        return {
            success: false,
            message: 'Network error while sending SMS',
        };
    }
}

/**
 * Генерация 6-значного кода
 */
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
