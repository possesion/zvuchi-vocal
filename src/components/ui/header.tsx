import { navigationList } from "@/app/constants";
import Image from "next/image";

import Link from "next/link"

export const Header = () => {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
            <div className="container flex h-16 items-center justify-between">
                <Link href={'#'}>
                    <Image
                        src='/zvuchi-cropped.png'
                        width={230}
                        height={64}
                        alt='logo'
                    />
                </Link>
                <nav className="hidden md:flex gap-8">
                    {navigationList.map(({ id, text, sectionId }) => (<Link key={id}
                        href={sectionId}
                        className="cursor-pointer font-semibold text-brand hover:text-red-800 transition-colors duration-200 relative group"
                    >
                        {text}
                        {/* <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span> */}
                    </Link>))}

                </nav>
            </div>
        </header>
    )
}