"use client";

import { MapPin, Phone, Navigation, Clock } from "lucide-react";

export const Contacts = () => {
  return (
    <section id="contacts" className="py-12 md:py-16 bg-muted/30">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Контакты
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Свяжитесь с нами для записи на занятия или получения дополнительной
          информации
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Контактная информация */}
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin color="var(--brand)" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Адрес</h3>
              <p className="text-muted-foreground">
                Ленинградский проспект, д. 34
                <br />
                Москва, 125040
                <br />
                Ближайшее метро: &ldquo;Динамо&rdquo; или &ldquo;Петровский
                парк&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone color="var(--brand)" className="h-6 w-6 text-primary" />
            </div>
            <div>
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
          </div>

          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock color="var(--brand)" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Режим работы</h3>
              <p className="text-muted-foreground">
                Ежедневно: 10:00 - 22:00
                <br />
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Navigation
                color="var(--brand)"
                className="h-6 w-6 text-primary"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Как добраться</h3>
              <p className="text-muted-foreground">
                <strong>На метро:</strong> Выход из метро &ldquo;Динамо&rdquo; в
                сторону Ленинградский проспект, д. 34
                <br />
                <strong>На машине:</strong> Парковка доступна во дворе здания
              </p>
            </div>
          </div>
        </div>

        {/* Схема проезда */}
        <div className="space-y-6">
          <div className="bg-background rounded-lg p-2 border border-brand">
            <div className="bg-muted/50 rounded-lg p-4">
              <div style={{ position: "relative", overflow: "hidden" }}>
                <a
                  href="https://yandex.ru/maps/org/zvuchi_/174002347974/?utm_medium=mapframe&utm_source=maps"
                  style={{
                    color: "#eee",
                    fontSize: "12px",
                    position: "absolute",
                    top: "0px",
                  }}
                >
                  Звучи!
                </a>
                <a
                  href="https://yandex.ru/maps/213/moscow/category/music_school/184105912/?utm_medium=mapframe&utm_source=maps"
                  style={{
                    color: "#eee",
                    fontSize: "12px",
                    position: "absolute",
                    top: "14px",
                  }}
                >
                  Музыкальное образование в Москве
                </a>
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=37.568838%2C55.785762&mode=search&oid=174002347974&ol=biz&z=17.13"
                  width="100%"
                  height="400"
                  allowFullScreen
                  style={{ position: "relative" }}
                  title="Yandex Map of Звучи!"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        {/* Отзывы. Добавить потом */}
        {/* <div className="col-span-2"
          style={{ width: '800px', height: '560px', overflow: 'hidden', position: 'relative' }}>
          <iframe className="w-full h-full border border-[#e6e6e6] rounded-2" src="https://yandex.ru/maps-reviews-widget/174002347974?comments">
          </iframe>
          <a href="https://yandex.ru/maps/org/zvuchi_/174002347974/"
            target="_blank"
            style={{ boxSizing: 'border-box', textDecoration: 'none', color: '#b3b3b3', fontSize: '10px', padding: '0 20px', position: 'absolute', bottom: '8px', width: '100%', textAlign: 'center', left: '0', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxHeight: '14px', whiteSpace: 'nowrap' }}>
            Звучи! на карте Москвы — Яндекс Карты
          </a>
        </div> */}
      </div>
    </section>
  );
};
