"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@radix-ui/themes";

// import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, MusicIcon } from "lucide-react"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85%] sm:w-[385px] pr-0">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <MusicIcon className="h-6 w-6 text-primary" />
              <span>ЗВУЧИ</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4">
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
              href="#testimonials"
              className="flex items-center py-2 text-base font-medium border-b border-border"
              onClick={handleLinkClick}
            >
              Истории успеха
            </Link>
            <Link
              href="#about"
              className="flex items-center py-2 text-base font-medium border-b border-border"
              onClick={handleLinkClick}
            >
              О нас
            </Link>
            <Link
              href="#contacts"
              className="flex items-center py-2 text-base font-medium border-b border-border"
              onClick={handleLinkClick}
            >
              Контакты
            </Link>
            <div className="pt-4 space-y-4">
              <Button variant="outline" className="w-full">
                Войти
              </Button>
              <Button className="w-full">Записаться</Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
