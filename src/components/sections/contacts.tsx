'use client'

import { MapPin, Phone, Mail } from 'lucide-react'
import { ORGANIZATION_EMAIL } from '@/components/constants'

export const Contacts = () => {

    return (
        <section id="contacts" className="py-8 text-white bg-muted/30 lg:py-12 ">
            <div className="flex flex-col items-center text-center mb-4 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                    Контакты
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Контактная информация */}
                <div className="flex flex-col justify-center items-center col-span-2 gap-x-8 sm:flex-row xl:col-span-2">
                    <div className="w-60 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Адрес</h3>
                        <p className="text-muted-foreground">
                            Ленинградский проспект, д. 34
                            <br />
                            Москва, 125040
                        </p>
                    </div>

                    <div className="w-60 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Phone
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Телефон</h3>
                        <p className="text-muted-foreground">
                            <a
                                href="tel:+74951234567"
                                className="hover:text-primary transition-colors"
                            >
                                +7 (977) 967-50-01
                            </a>
                            <br />
                            <a
                                href="tel:+79001234567"
                                className="hover:text-primary transition-colors"
                            >
                                +7 (985) 126-66-05
                            </a>
                        </p>
                    </div>

                    <div className="w-60 flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Mail
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            Электронная&nbsp;почта
                        </h3>
                        <p className="text-muted-foreground">
                            {ORGANIZATION_EMAIL}
                        </p>
                    </div>
                </div>
                {/* Схема проезда */}
                <div className="bg-background rounded-lg p-2 border border-brand m-auto w-[375px] h-[550px] space-y-3 md:w-[500px] lg:space-y-6 lg:w-[500px] xl:h-[650px] 2xl:w-[500px] col-span-2 lg:col-span-1">
                    <div className="bg-muted/50 rounded-lg">
                        <div
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <a
                                href="https://yandex.ru/maps/org/zvuchi_/174002347974/?utm_medium=mapframe&utm_source=maps"
                                style={{
                                    color: '#eee',
                                    fontSize: '12px',
                                    position: 'absolute',
                                    top: '0px',
                                }}
                            >
                                Звучи!
                            </a>
                            <a
                                href="https://yandex.ru/maps/213/moscow/category/music_school/184105912/?utm_medium=mapframe&utm_source=maps"
                                style={{
                                    color: '#eee',
                                    fontSize: '12px',
                                    position: 'absolute',
                                    top: '14px',
                                }}
                            >
                                Музыкальное образование в Москве
                            </a>
                            <iframe
                                src="https://yandex.ru/map-widget/v1/?ll=37.568838%2C55.785762&mode=search&oid=174002347974&ol=biz&z=17.13"
                                width="100%"
                                className='h-[530px] xl:h-[630px]'
                                allowFullScreen
                                style={{ position: 'relative' }}
                                title="Yandex Map of Звучи!"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="bg-background rounded-lg p-2 border border-brand m-auto w-[375px] h-[550px] overflow-auto relative md:w-[500px] lg:w-[500px] xl:h-[650px] 2xl:w-[500px] col-span-2 lg:col-span-1">
                    <iframe
                        className="w-full h-full border-[#e6e6e6] box-border rounded-b-md"
                        src="https://yandex.ru/maps-reviews-widget/174002347974?comments"
                    ></iframe>
                    <a
                        href="https://yandex.ru/maps/org/zvuchi_/174002347974/"
                        target="_blank"
                        className="text-[var(--brand)] text-sm px-5 absolute bottom-2 w-full text-center left-0 overflow-ellipsis"
                    >
                        Звучи! на карте Москвы — Яндекс Карты
                    </a>
                </div>
            </div>
        </section>
    )
}
