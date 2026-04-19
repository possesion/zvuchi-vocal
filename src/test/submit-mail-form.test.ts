import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitMailForm } from '@/lib/submit-mail-form'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
    vi.clearAllMocks()
})

describe('submitMailForm', () => {
    it('возвращает { ok: true, data } при успешном ответе', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Отправлено' }),
        })
        const result = await submitMailForm({ name: 'Иван', phone: '+7 (916) 123-45-67', formType: 'enrollment-form' })
        expect(result).toEqual({ ok: true, data: { message: 'Отправлено' } })
    })

    it('отправляет POST на /api/send-mail с правильными заголовками', async () => {
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
        const data = { name: 'Иван', formType: 'enrollment-form' }
        await submitMailForm(data)
        expect(mockFetch).toHaveBeenCalledWith('/api/send-mail', expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }))
    })

    it('возвращает { ok: false, error } при ответе с ошибкой', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Сервер недоступен' }),
        })
        const result = await submitMailForm({})
        expect(result).toEqual({ ok: false, error: 'Сервер недоступен' })
    })

    it('возвращает дефолтную ошибку если сервер не вернул error', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({}),
        })
        const result = await submitMailForm({})
        expect(result).toEqual({ ok: false, error: 'Произошла ошибка' })
    })

    it('возвращает { ok: false, error } при сетевом исключении', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'))
        const result = await submitMailForm({})
        expect(result).toEqual({ ok: false, error: 'Произошла ошибка при отправке' })
    })
})
