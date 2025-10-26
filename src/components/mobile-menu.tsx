'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@radix-ui/themes'
// import MenuBurger from '../app/burger-menu.svg';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/modals/sheet-enhanced'
import BurgerMenu from '@/app/burger-menu';

export default function MobileMenu() {
    const [open, setOpen] = useState(false)

    const handleLinkClick = () => {
        setOpen(false)
    }

    return (
        <div className="z-50 pr-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden">
                        <BurgerMenu color="#291313" className="h-6 w-12" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex text-white items-center gap-2">
                            {/* <span>Меню</span> */}
                            <img
                                className="w-40 h-10 md:w-56 md:h-16"
                                src="/logo-white.svg"
                                alt="logo"
                            />
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="px-2 py-2 font-exo2 text-2xl flex flex-col space-y-4">
                        <Link
                            href="#about"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            О нас
                        </Link>
                        <Link
                            href="#subscriptions"
                            className="flex items-center"
                            onClick={handleLinkClick}
                        >
                            Абонементы
                        </Link>
                        <Link
                            href="#instructors"
                            className="flex items-center"
                            onClick={handleLinkClick}
                        >
                            Преподаватели
                        </Link>
                        <Link
                            href="#gallery"
                            className="flex items-center"
                            onClick={handleLinkClick}
                        >
                            Галерея
                        </Link>
                        <Link
                            href="#contacts"
                            className="flex items-center"
                            onClick={handleLinkClick}
                        >
                            Контакты
                        </Link>
                        {/* <PlatformDialog
                            trigger={
                                <button className="flex items-center py-2 text-base font-medium border-b border-border">
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
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}
