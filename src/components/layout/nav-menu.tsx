'use client';

import Link from 'next/link';
import { navigationList } from '@/app/constants';
import { PlatformDialog } from '../modals/platform-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { SubscriptionsPaymentWidget } from '../common/subscription-payment-widget';

export const NavMenu = () => {
    return (
        <nav className="hidden gap-8 md:flex">
            {navigationList.map(({ id, text, sectionId }) => (
                <Link
                    key={id}
                    href={sectionId}
                    className="group relative cursor-pointer text-lg font-bold text-white transition-colors duration-200"
                >
                    {text}
                </Link>
            ))}
            <PlatformDialog className="h-[90lvh] w-[340px] md:w-[620px]"
                trigger={
                    <button className="group relative cursor-pointer text-lg font-bold text-white transition-colors duration-200">
                        Оплата
                    </button>
                }
            >
                <div className="h-full p-6">
                    <Dialog.Title className="mb-4 text-white text-2xl font-bold">
                        Оплата
                    </Dialog.Title>
                    <SubscriptionsPaymentWidget />
                </div>
            </PlatformDialog>
        </nav>
    );
};
