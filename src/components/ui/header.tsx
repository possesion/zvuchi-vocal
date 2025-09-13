import Image from 'next/image'
import Link from 'next/link'
import MobileMenu from '@/components/mobile-menu'
import { NavMenu } from '@/components/ui/nav-menu'

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 border-b bg-foreground backdrop-blur supports-[backdrop-filter]:bg-foreground/90 shadow-lg">
            <div className="container flex h-16 items-center justify-between">
                <Link href={'#'}>
                    <Image
                        className="ml-2"
                        src="/zvuchi-cropped.png"
                        width={230}
                        height={64}
                        alt="logo"
                    />
                </Link>
                <NavMenu />
                <MobileMenu />
            </div>
        </header>
    )
}
