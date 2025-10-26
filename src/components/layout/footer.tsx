'use client';

import Image from 'next/image'
import { Offera } from '../common/offera';
import { OGRNIP, INN } from '../constants';

export const Footer = () => {
    return (
        <footer className="border-t py-2 md:py-4 bg-foreground supports-backdrop-filter:bg-foreground/90">
            <div className="container relative w-full flex flex-col justify-between sm:items-center lg:flex-row">
                <div className="flex items-center justify-center gap-2 text-white">
                    <Image
                        src="/zvuchi-cropped.png"
                        width={100}
                        height={38}
                        alt="logo"
                    />
                    © {new Date().getFullYear()}
                </div>
                <div className="pb-2 flex flex-col gap-2 lg:flex-row">
                    <p className="text-sm text-white">
                        <span className="font-bold mr-2">ИП</span>Казанцев
                        Геннадий Викторович{' '}
                    </p>
                    <p className="flex text-sm text-white">
                        <span className="font-bold mr-2">ОГРНИП</span>
                        {OGRNIP}
                        <span className="font-bold mx-2">ИНН</span>
                        {INN}
                    </p>
                </div>

                <div className="py-2 flex flex-col items-start gap-2">
                    <h4 className="text-lg font-bold text-white">
                        О компании
                    </h4>
                    <Offera document='/documents/privacy.txt'>
                        <button className="cursor-pointer text-white hover:text-brand dark:hover:text-red-400 transition-colors duration-200 relative group">
                            Политика конфиденциальности
                        </button>
                    </Offera>
                    <Offera document='/documents/oferta_zvuchi.docx'>
                        <button className="cursor-pointer text-white hover:text-brand dark:hover:text-red-400 transition-colors duration-200 relative group">
                            Публичная оферта
                        </button>
                    </Offera>
                </div>
            </div>
        </footer>
    )
}