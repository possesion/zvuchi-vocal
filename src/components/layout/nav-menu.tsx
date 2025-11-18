'use client';

import Link from 'next/link';
import { navigationList } from '@/app/constants';
import { PlatformDialog } from '../modals/platform-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import cn from 'classnames'
import { SubscriptionsPaymentWidget } from '../common/subscription-payment-widget';

export const NavMenu = () => {
    return (
        <nav className="hidden gap-4 md:flex lg:gap-8">
            {navigationList.map(({ hiddenOnMobile, id, text, sectionId }) => (
                <Link
                    key={id}
                    href={sectionId}
                    className={cn({ 'hidden lg:block': hiddenOnMobile }, 'group relative cursor-pointer text-lg font-bold text-white transition-colors duration-200')}
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
