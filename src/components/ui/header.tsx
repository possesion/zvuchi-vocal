import Image from 'next/image'
import Link from 'next/link'
import MobileMenu from '@/components/mobile-menu'
import { NavMenu } from '@/components/ui/nav-menu'

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 border-b bg-foreground backdrop-blur supports-[backdrop-filter]:bg-foreground/90 shadow-lg">
            <div className="container flex h-12 items-center justify-between md:h-16">
                <Link href={'#'}>
                    <img
                        className="ml-2 w-40 h-10 md:w-56 md:h-16"
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
