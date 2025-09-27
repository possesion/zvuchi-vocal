import Link from 'next/link'
import MobileMenu from '@/components/mobile-menu'
import { NavMenu } from './nav-menu'

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 border-b bg-foreground backdrop-blur supports-[backdrop-filter]:bg-foreground/90 shadow-lg">
            <div className="flex h-12 px-2 items-center justify-between md:px-4 md:h-16">
                <Link href={'#'}>
                    <img
                        className="w-40 h-10 md:w-56 md:h-16"
                        src="/zvuchi-cropped.png"
                        alt="logo"
                    />
                </Link>
                <NavMenu />
                <MobileMenu />
            </div>
        </header>
    )
}
