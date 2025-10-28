import { Dialog } from 'radix-ui'
import { FC, ReactNode } from 'react'
import 'react-image-gallery/styles/css/image-gallery.css'

interface PlatformDialogProps {
    children: ReactNode
    trigger: ReactNode
    className?: string
}
export const PlatformDialog: FC<PlatformDialogProps> = ({
    children,
    className,
    trigger,
}) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform outline-none"
                >
                    <div
                        className={`relative overflow-auto rounded-lg bg-white shadow-xl ${className}`}
                    >
                        {children}
                        <Dialog.Close asChild>
                            <button
                                className="z-100 absolute right-7 top-4 rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 md:right-4"
                                aria-label="Закрыть диалог"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
