/**
 * Alfa CRM API Integration
 * Документация: https://alfacrm.pro/api
 */

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface AuthResponse {
    token?: string;
    error?: string;
}

interface CustomerData {
    id: number;
    name: string;
    phone: string[];
    email?: string;
    balance?: number; // Баланс договора
    lesson_count?: number; // Остаток уроков
    next_lesson_date?: string; // Дата следующего урока (YYYY-MM-DD)
    last_attend_date?: string; // Дата последнего посещения (YYYY-MM-DD)
    paid_count?: string; // Количество оплаченных занятий
    is_study: 0 | 1; // 0 - лид, 1 - клиент
    created_at?: string;
    updated_at?: string;
}

interface CustomerIndexPayload {
    is_study?: 0 | 1;
    phone?: string[];
    page?: number;
    removed?: 0 | 1 | 2;
}

interface CustomerIndexResponse {
    items?: CustomerData[];
    total?: number;
    error?: string;
}

// ─── Константы ────────────────────────────────────────────────────────────────

const HOSTNAME = 'https://zvuchi.s20.online';
const TOKEN_EXPIRY_MS = 3500 * 1000; // 3500 секунд
const CACHE_TTL_MS = 60 * 1000; // 1 минута
const REQUEST_TIMEOUT_MS = 10000; // 10 секунд

// ─── Состояние ────────────────────────────────────────────────────────────────

let authToken: string | null = null;
let tokenExpiry: number | null = null;

// Кэш данных клиентов: Map<phone, { data, timestamp }>
const clientCache = new Map<string, { data: CustomerData | null; timestamp: number }>();

// ─── Вспомогательные функции ──────────────────────────────────────────────────

/**
 * Нормализация номера телефона для запроса в CRM
 * Поддерживает форматы: +79991234567, 79991234567, 89991234567
 */
function normalizePhone(phone: string): string[] {
    const cleaned = phone.replace(/\D/g, '');
    
    // Пробуем оба варианта: с +7 и без
    const variants: string[] = [];
    
    if (cleaned.startsWith('7') && cleaned.length === 11) {
        variants.push(`+${cleaned}`); // +79991234567
        variants.push(cleaned); // 79991234567
    } else if (cleaned.startsWith('8') && cleaned.length === 11) {
        const with7 = '7' + cleaned.slice(1);
        variants.push(`+${with7}`); // +79991234567
        variants.push(with7); // 79991234567
    }
    
    return variants.length > 0 ? variants : [phone];
}

// ─── Авторизация ──────────────────────────────────────────────────────────────

/**
 * Получение токена авторизации для Alfa CRM API
 */
async function getAuthToken(): Promise<string> {
    // Проверяем кэшированный токен
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
        return authToken;
    }

    const email = process.env.CRM_EMAIL;
    const apiKey = process.env.CRM_API_KEY;

    if (!email || !apiKey) {
        throw new Error('CRM_EMAIL и CRM_API_KEY должны быть настроены в переменных окружения');
    }

    try {
        console.log('[Alfa CRM] Запрос токена авторизации...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(`${HOSTNAME}/v2api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, api_key: apiKey }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AuthResponse = await response.json();

        if (!data.token) {
            throw new Error('Токен не получен: ' + JSON.stringify(data));
        }

        authToken = data.token;
        tokenExpiry = Date.now() + TOKEN_EXPIRY_MS;
        
        console.log('[Alfa CRM] Токен успешно получен');
        return authToken;
    } catch (error) {
        console.error('[Alfa CRM] Ошибка получения токена:', error);
        throw new Error('Не удалось авторизоваться в CRM');
    }
}

// ─── API Запросы ──────────────────────────────────────────────────────────────

/**
 * Выполнение запроса к Alfa CRM API
 */
async function apiRequest<T>(url: string, payload: unknown): Promise<T> {
    try {
        let token = await getAuthToken();

        const makeRequest = async (authToken: string): Promise<Response> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-ALFACRM-TOKEN': authToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        };

        let response = await makeRequest(token);

        // Если токен устарел, обновляем и повторяем запрос
        if (response.status === 401) {
            console.log('[Alfa CRM] Токен устарел, обновляем...');
            authToken = null;
            tokenExpiry = null;
            token = await getAuthToken();
            response = await makeRequest(token);
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Alfa CRM] Ошибка API запроса:', error);
        throw new Error('Ошибка при обращении к CRM');
    }
}

// ─── Публичные функции ────────────────────────────────────────────────────────

/**
 * Получение данных клиента по номеру телефона
 * @param phone - номер телефона в формате +79991234567
 * @param forceRefresh - принудительное обновление, игнорируя кэш
 */
export async function getClientData(
    phone: string,
    forceRefresh = false
): Promise<CustomerData | null> {
    const cacheKey = phone;
    const cached = clientCache.get(cacheKey);

    // Проверяем кэш
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log('[Alfa CRM] Данные клиента из кэша');
        return cached.data;
    }

    try {
        // Нормализуем номер телефона (пробуем оба варианта: с + и без)
        const phoneVariants = normalizePhone(phone);

        const payload: CustomerIndexPayload = {
            is_study: 1, // Только клиенты (не лиды)
            phone: phoneVariants,
            page: 0,
            removed: 0, // Только активные
        };

        console.log('[Alfa CRM] Запрос данных клиента:', phoneVariants);

        const result = await apiRequest<CustomerIndexResponse>(
            `${HOSTNAME}/v2api/1/customer/index`,
            payload
        );

        const clientData = result.items?.[0] || null;

        // Сохраняем в кэш
        clientCache.set(cacheKey, {
            data: clientData,
            timestamp: Date.now(),
        });

        if (clientData) {
            console.log('[Alfa CRM] Данные клиента получены:', clientData.name);
        } else {
            console.log('[Alfa CRM] Клиент не найден');
        }

        return clientData;
    } catch (error) {
        console.error('[Alfa CRM] Ошибка получения данных клиента:', error);
        
        // Сохраняем ошибку в кэш, чтобы не спамить CRM
        clientCache.set(cacheKey, {
            data: null,
            timestamp: Date.now(),
        });
        
        throw error;
    }
}

/**
 * Очистка кэша клиента
 */
export function clearClientCache(phone?: string): void {
    if (phone) {
        clientCache.delete(phone);
        console.log('[Alfa CRM] Кэш очищен для:', phone);
    } else {
        clientCache.clear();
        console.log('[Alfa CRM] Весь кэш очищен');
    }
}
