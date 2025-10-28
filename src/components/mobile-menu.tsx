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
                        <span className="sr-only">Открыть меню</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-white">
                            <img
                                className="h-10 w-40 md:h-16 md:w-56"
                                src="/logo-white.svg"
                                alt="Логотип школы вокала Звучи!"
                            />
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-4 px-2 py-2 text-2xl font-exo2">
                        <Link
                            href="#about"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            О нас
                        </Link>
                        <Link
                            href="#subscriptions"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            Абонементы
                        </Link>
                        <Link
                            href="#instructors"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            Преподаватели
                        </Link>
                        <Link
                            href="#gallery"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            Галерея
                        </Link>
                        <Link
                            href="#contacts"
                            className="flex items-center hover:text-red-400"
                            onClick={handleLinkClick}
                        >
                            Контакты
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}
