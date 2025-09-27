'use client'

import Link from 'next/link'
import { navigationList } from '@/app/constants'
import { Offera } from '../common/offera'

// import PaymentForm from '@/components/ui/payment-form'

export const NavMenu = () => {
    return (
        <nav className="hidden md:flex gap-8">
            {navigationList.map(({ id, text, sectionId }) => (
                <Link
                    key={id}
                    href={sectionId}
                    className="cursor-pointer font-bold text-white hover:text-brand dark:hover:text-red-400 transition-colors duration-200 relative group"
                >
                    {text}
                </Link>
            ))}
            {/* <PlatformDialog className='w-[340px] max-h-[90vh]  md:w-[500px]'
                trigger={
                    <button className="cursor-pointer font-bold text-white hover:text-brand dark:hover:text-red-400 transition-colors duration-200 relative group">
                        Оплата
                    </button>
                }
            >
                <div className="p-6">
                    <Dialog.Title className="text-2xl font-bold mb-4">
                        Оплата
                    </Dialog.Title>
                    <PaymentForm />
                </div>
            </PlatformDialog> */}
            <Offera>
                <button className="cursor-pointer font-bold text-white hover:text-brand dark:hover:text-red-400 transition-colors duration-200 relative group">
                    Оферта
                </button>
            </Offera>
        </nav>
    )
}
