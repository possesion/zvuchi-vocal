import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContactForm } from '@/hooks/useContactForm'

describe('useContactForm', () => {
    it('инициализируется с пустыми значениями', () => {
        const { result } = renderHook(() => useContactForm())
        expect(result.current.formData).toEqual({ name: '', phone: '' })
        expect(result.current.isAgreed).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
    })

    it('обновляет имя через handleChange', () => {
        const { result } = renderHook(() => useContactForm())
        act(() => {
            result.current.handleChange({
                target: { name: 'name', value: 'Иван' },
            } as React.ChangeEvent<HTMLInputElement>)
        })
        expect(result.current.formData.name).toBe('Иван')
    })

    it('форматирует телефон через handleChange', () => {
        const { result } = renderHook(() => useContactForm())
        act(() => {
            result.current.handleChange({
                target: { name: 'phone', value: '79161234567' },
            } as React.ChangeEvent<HTMLInputElement>)
        })
        expect(result.current.formData.phone).toBe('+7 (916) 123-45-67')
    })

    it('заменяет 8 на 7 при форматировании телефона', () => {
        const { result } = renderHook(() => useContactForm())
        act(() => {
            result.current.handleChange({
                target: { name: 'phone', value: '89161234567' },
            } as React.ChangeEvent<HTMLInputElement>)
        })
        expect(result.current.formData.phone).toBe('+7 (916) 123-45-67')
    })

    it('reset сбрасывает форму и согласие', () => {
        const { result } = renderHook(() => useContactForm())
        act(() => {
            result.current.handleChange({ target: { name: 'name', value: 'Иван' } } as React.ChangeEvent<HTMLInputElement>)
            result.current.setIsAgreed(true)
        })
        act(() => { result.current.reset() })
        expect(result.current.formData).toEqual({ name: '', phone: '' })
        expect(result.current.isAgreed).toBe(false)
    })

    it('handleValidate устанавливает кастомное сообщение валидации', () => {
        const { result } = renderHook(() => useContactForm())
        const mockInput = { setCustomValidity: vi.fn() } as unknown as HTMLInputElement
        result.current.handleValidate('Введите имя')({ currentTarget: mockInput } as unknown as Parameters<ReturnType<typeof result.current.handleValidate>>[0])
        expect(mockInput.setCustomValidity).toHaveBeenCalledWith('Введите имя')
    })
})
