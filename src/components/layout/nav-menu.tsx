'use client';

import Link from 'next/link';
import { navigationList } from '@/app/constants';
// import PaymentForm from '@/components/ui/payment-form'

export const NavMenu = () => {
    return (
        <nav className="hidden gap-8 md:flex">
            {navigationList.map(({ id, text, sectionId }) => (
                <Link
                    key={id}
                    href={sectionId}
                    className="group relative cursor-pointer text-lg font-bold text-white transition-colors duration-200 hover:text-brand dark:hover:text-red-400"
                >
                    {text}
                </Link>
            ))}
            {/* <PlatformDialog className="max-h-[90vh] w-[340px] md:w-[500px]"
                trigger={
                    <button className="group relative cursor-pointer font-bold text-white transition-colors duration-200 hover:text-brand dark:hover:text-red-400">
                        Оплата
                    </button>
                }
            >
                <div className="p-6">
                    <Dialog.Title className="mb-4 text-2xl font-bold">
                        Оплата
                    </Dialog.Title>
                    <PaymentForm />
                </div>
            </PlatformDialog> */}
        </nav>
    );
};
