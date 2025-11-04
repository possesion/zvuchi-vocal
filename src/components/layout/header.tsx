import Link from 'next/link'
import MobileMenu from '@/components/mobile-menu'
import { NavMenu } from './nav-menu'

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 header-bg shadow-xl backdrop-blur-md backdrop-saturate-150">
            <div className="container mx-auto flex h-12 items-center justify-between px-2 md:h-16">
                <Link href="#" aria-label="Перейти на главную страницу">
                    <img
                        className="h-12 w-40 md:h-16 md:w-56"
                        src="/zvuchi-cropped.png"
                        alt="Логотип школы вокала Звучи!"
                    />
                </Link>
                <NavMenu />
                <MobileMenu />
            </div>
        </header>
    )
}
