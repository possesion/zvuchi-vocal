import { InputHTMLAttributes, forwardRef } from 'react'
import cn from 'classnames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
