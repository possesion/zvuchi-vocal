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
                <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
                <Dialog.Content
                    aria-describedby="контент модального окна"
                    className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 outline-none"
                >
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-[340px] max-h-[90vh] overflow-auto md:w-[500px] ${className}`}
                    >
                        {children}
                        <Dialog.Close asChild>
                            <button
                                className="absolute top-4 right-4 bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Close"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
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
