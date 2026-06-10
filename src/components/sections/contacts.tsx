'use client'

import { trackEvent } from '@/hooks/use-yandex-metrica'

export const Contacts = () => {

    const handleMapClick = () => {
        trackEvent('map_click');
    };

    return (
        <section id="contacts" className="mx-auto bg-muted/30 py-8 text-white lg:py-12">
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">

                {/* Схема проезда */}
                <div className="col-span-2 m-auto h-[500px] w-[335px] space-y-3 rounded-sm border border-brand bg-background p-2 md:w-[450px] md:h-[600px] lg:col-span-1 lg:space-y-6 xl:h-[600px] xl:w-[500px]">

                    <div className="rounded-sm bg-muted/50">
                        <div
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <a
                                href="https://yandex.ru/maps/org/zvuchi_/174002347974/?utm_medium=mapframe&utm_source=maps"
                                onClick={handleMapClick}
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
                                loading='lazy'
                                className="h-[480px] md:h-[580px]" // Карта xl:h-[480px]
                                allowFullScreen
                                style={{ position: 'relative' }}
                                title="Карта расположения школы вокала Звучи!"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="relative col-span-2 m-auto h-[760px] w-[335px] overflow-auto rounded-sm border border-brand bg-background p-2 md:w-[450px] md:h-[600px] lg:col-span-1 lg:w-[450px] sm:h-[600px] xl:w-[500px]">
                    <iframe
                        className="box-border h-full w-full rounded-b-md border-[#e6e6e6]"
                        loading='lazy'
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
