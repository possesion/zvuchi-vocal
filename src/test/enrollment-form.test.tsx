import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnrollmentForm from '@/components/forms/enrollment-form'
import * as submitMailFormModule from '@/lib/submit-mail-form'
import * as metricaModule from '@/hooks/use-yandex-metrica'
import * as uiContextModule from '@/components/providers/ui-context'

// Мокаем зависимости
vi.mock('@/lib/submit-mail-form')
vi.mock('@/hooks/use-yandex-metrica')
vi.mock('@/components/providers/ui-context')
vi.mock('@/components/common/offera', () => ({
    Offera: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockNotify = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uiContextModule.useUI).mockReturnValue({
        notify: mockNotify,
        quizOpen: false,
        setQuizOpen: vi.fn(),
    })
})

async function fillAndSubmitForm(name = 'Иван', phone = '+7 (916) 123-45-67') {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/ваше имя/i), name)
    await user.type(screen.getByLabelText(/телефон/i), phone)
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /хочу записаться/i }))
}

describe('EnrollmentForm — успешная отправка', () => {
    it('вызывает submitMailForm с правильными данными', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: true,
            data: { message: 'Спасибо!' },
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(submitMailFormModule.submitMailForm).toHaveBeenCalledWith(
                expect.objectContaining({ formType: 'enrollment-form' })
            )
        })
    })

    it('вызывает trackEvent("call_request") при успехе', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: true,
            data: { message: 'Спасибо!' },
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(metricaModule.trackEvent).toHaveBeenCalledWith('call_request')
        })
    })

    it('показывает уведомление об успехе из ответа сервера', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: true,
            data: { message: 'Заявка принята!' },
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith('Заявка принята!', 'success')
        })
    })

    it('показывает дефолтное уведомление если сервер не вернул message', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: true,
            data: {},
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith(
                'Спасибо! Мы свяжемся с вами в ближайшее время.',
                'success'
            )
        })
    })

    it('сбрасывает форму после успешной отправки', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: true,
            data: {},
        })
        render(<EnrollmentForm />)
        const nameInput = screen.getByLabelText(/ваше имя/i)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(nameInput).toHaveValue('')
        })
    })
})

describe('EnrollmentForm — ошибка сервера', () => {
    it('показывает ошибку из ответа сервера', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: false,
            error: 'Сервер недоступен',
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith('Сервер недоступен', 'error')
        })
    })

    it('показывает дефолтную ошибку если сервер не вернул error', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: false,
            error: undefined,
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith(
                'Произошла ошибка при отправке заявки. Попробуйте позже.',
                'error'
            )
        })
    })

    it('НЕ вызывает trackEvent при ошибке', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockResolvedValue({
            ok: false,
            error: 'Ошибка',
        })
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(metricaModule.trackEvent).not.toHaveBeenCalled()
        })
    })
})

describe('EnrollmentForm — сетевая ошибка', () => {
    it('показывает уведомление об ошибке при исключении', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockRejectedValue(new Error('Network error'))
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith(
                'Произошла ошибка при отправке заявки. Попробуйте позже.',
                'error'
            )
        })
    })

    it('НЕ вызывает trackEvent при сетевой ошибке', async () => {
        vi.mocked(submitMailFormModule.submitMailForm).mockRejectedValue(new Error('Network error'))
        render(<EnrollmentForm />)
        await fillAndSubmitForm()
        await waitFor(() => {
            expect(metricaModule.trackEvent).not.toHaveBeenCalled()
        })
    })
})

describe('EnrollmentForm — состояние кнопки', () => {
    it('кнопка отправки заблокирована без согласия', () => {
        render(<EnrollmentForm />)
        expect(screen.getByRole('button', { name: /хочу записаться/i })).toBeDisabled()
    })

    it('кнопка активна после заполнения формы и согласия', async () => {
        const user = userEvent.setup()
        render(<EnrollmentForm />)
        await user.click(screen.getByRole('checkbox'))
        expect(screen.getByRole('button', { name: /хочу записаться/i })).not.toBeDisabled()
    })
})
