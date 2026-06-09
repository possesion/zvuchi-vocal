'use client';

import Link from 'next/link';
import { navigationList } from '@/app/constants';
import cn from 'classnames'
import { UserAvatar } from './user-avatar';
import { useSession } from 'next-auth/react';
// import { PlatformDialog } from '../modals/platform-dialog';
// import * as Dialog from '@radix-ui/react-dialog';
// import { SubscriptionsPaymentWidget } from '../common/subscription-payment-widget';

export const NavMenu = () => {
    const { status } = useSession();
    const isAuthorized = status === 'authenticated';

    return (
        <nav className="hidden gap-4 lg:flex lg:gap-8">
            {navigationList.map(({ hiddenOnMobile, id, text, sectionId }) => (
                <Link
                    key={id}
                    href={sectionId}
                    className={cn({ 'hidden xl:block': hiddenOnMobile }, 'group relative cursor-pointer text-lg font-bold text-white transition-colors duration-200 hover:text-brand')}
                >
                    {text}
                </Link>
            ))}
            {/* <PlatformDialog className="h-[90lvh] w-[340px] md:w-[620px]"
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
            </PlatformDialog> */}

            {isAuthorized ?
                <UserAvatar className='-translate-y-[3px] relative hidden lg:flex items-center' />
                : <Link
                    href="/login"
                    className="flex text-lg font-bold items-center hover:text-red-400"
                >
                    Войти
                </Link>}
        </nav>
    );
};
