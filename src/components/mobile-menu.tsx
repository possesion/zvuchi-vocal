'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@radix-ui/themes'

// import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet-enhanced'
import { MenuIcon } from 'lucide-react'
import { Offera } from './ui/offera'

export default function MobileMenu() {
    const [open, setOpen] = useState(false)

    const handleLinkClick = () => {
        setOpen(false)
    }

    return (
        <div className="pr-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden">
                        <MenuIcon color="var(--brand)" className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <span>Меню</span>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-4">
                        <Link
                            href="#about"
                            className="flex items-center py-2 text-base font-medium border-b border-border"
                            onClick={handleLinkClick}
                        >
                            О нас
                        </Link>
                        <Link
                            href="#subscriptions"
                            className="flex items-center py-2 text-base font-medium border-b border-border"
                            onClick={handleLinkClick}
                        >
                            Абонементы
                        </Link>
                        <Link
                            href="#instructors"
                            className="flex items-center py-2 text-base font-medium border-b border-border"
                            onClick={handleLinkClick}
                        >
                            Преподаватели
                        </Link>
                        <Link
                            href="#gallery"
                            className="flex items-center py-2 text-base font-medium border-b border-border"
                            onClick={handleLinkClick}
                        >
                            Галерея
                        </Link>
                        <Link
                            href="#contacts"
                            className="flex items-center py-2 text-base font-medium border-b border-border"
                            onClick={handleLinkClick}
                        >
                            Контакты
                        </Link>
                        <Offera>
                            <div
                                className="flex items-center py-2 text-base font-medium border-b border-border"
                            >
                                Оферта
                            </div>
                        </Offera>
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
