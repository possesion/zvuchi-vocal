'use client';

import Image from 'next/image'
import { Offera } from '../common/offera';
import { OGRNIP, INN } from '../constants';

export const Footer = () => {
    return (
        <footer className="border-t bg-foreground py-2 supports-backdrop-filter:bg-foreground/90 md:py-4">
            <div className="container relative flex w-full flex-col justify-between sm:items-center lg:flex-row">
                <div className="flex items-center justify-center gap-2 text-white">
                    <Image
                        src="/zvuchi-cropped.png"
                        width={100}
                        height={38}
                        alt="Логотип школы вокала Звучи!"
                    />
                    © {new Date().getFullYear()}
                </div>
                
                <div className="flex flex-col gap-2 pb-2 lg:flex-row">
                    <p className="text-sm text-white">
                        <span className="mr-2 font-bold">ИП</span>Казанцев
                        Геннадий Викторович{' '}
                    </p>
                    <p className="flex text-sm text-white">
                        <span className="mr-2 font-bold">ОГРНИП</span>
                        {OGRNIP}
                        <span className="mx-2 font-bold">ИНН</span>
                        {INN}
                    </p>
                </div>

                <div className="flex flex-col items-start gap-2 py-2">
                    <h4 className="text-lg font-bold text-white">
                        О компании
                    </h4>
                    <Offera document="/documents/privacy.txt">
                        <button className="group relative cursor-pointer text-white transition-colors duration-200 hover:text-brand dark:hover:text-red-400">
                            Политика конфиденциальности
                        </button>
                    </Offera>
                    <Offera document="/documents/oferta_zvuchi.docx">
                        <button className="group relative cursor-pointer text-white transition-colors duration-200 hover:text-brand dark:hover:text-red-400">
                            Публичная оферта
                        </button>
                    </Offera>
                </div>
            </div>
        </footer>
    )
}