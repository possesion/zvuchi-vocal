'use client'

import { MapPin, Phone, Mail } from 'lucide-react'
import { ORGANIZATION_EMAIL } from '@/components/constants'

export const Contacts = () => {

    return (
        <section id="contacts" className="container mx-auto bg-muted/30 px-4 py-8 text-white lg:py-12">
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
                {/* Контактная информация */}
                <div className="col-span-2 flex flex-col items-center justify-center gap-x-8 sm:flex-row xl:col-span-2">
                    <address className="flex w-60 flex-col items-center not-italic">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <MapPin
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Адрес</h3>
                        <p className="text-muted-foreground">
                            Ленинградский проспект, д. 34
                            <br />
                            Москва, 125040
                        </p>
                    </address>

                    <div className="flex w-60 flex-col items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Phone
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Телефон</h3>
                        <p className="text-muted-foreground">
                            <a
                                href="tel:+79779675001"
                                className="transition-colors hover:text-primary"
                            >
                                +7 (977) 967-50-01
                            </a>
                            <br />
                            <a
                                href="tel:+79851266605"
                                className="transition-colors hover:text-primary"
                            >
                                +7 (985) 126-66-05
                            </a>
                        </p>
                    </div>

                    <div className="flex w-60 flex-col items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Mail
                                color="white"
                                className="h-6 w-6 text-primary"
                            />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">
                            Электронная&nbsp;почта
                        </h3>
                        <p className="text-muted-foreground">
                            <a
                                href={`mailto:${ORGANIZATION_EMAIL}`}
                                className="transition-colors hover:text-primary"
                            >
                                {ORGANIZATION_EMAIL}
                            </a>
                        </p>
                    </div>
                </div>

                {/* Схема проезда */}
                {/* <div className="col-span-2 m-auto h-[550px] w-[360px] space-y-3 rounded-lg border border-brand bg-background p-2 md:w-[500px] lg:col-span-1 lg:w-[500px] lg:space-y-6 xl:h-[600px] 2xl:w-[500px]"> */}
                <div className="col-span-2 m-auto h-[500px] w-[360px] space-y-3 rounded-lg border border-brand bg-background p-2 md:w-[450px] lg:col-span-1 lg:space-y-6 xl:h-[500px] 2xl:w-[450px]">

                    <div className="rounded-lg bg-muted/50">
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
                                className="h-[480px] xl:h-[480px]" // Карта
                                allowFullScreen
                                style={{ position: 'relative' }}
                                title="Карта расположения школы вокала Звучи!"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="relative col-span-2 m-auto h-[500px] w-[360px] overflow-auto rounded-lg border border-brand bg-background p-2 md:w-[450px] lg:col-span-1 lg:w-[450px] xl:h-[500px] 2xl:w-[500px]">
                    <iframe
                        className="box-border h-full w-full rounded-b-md border-[#e6e6e6]"
                        src="https://yandex.ru/maps-reviews-widget/174002347974?comments"
                        title="Отзывы о школе вокала Звучи!"
                    ></iframe>
                    <a
                        href="https://yandex.ru/maps/org/zvuchi_/174002347974/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--brand) absolute bottom-2 left-0 w-full text-ellipsis px-5 text-center text-sm"
                    >
                        Звучи! на карте Москвы — Яндекс Карты
                    </a>
                </div>
            </div>
        </section>
    )
}
