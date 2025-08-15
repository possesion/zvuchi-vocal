'use client';

import { MapPin, Phone, Navigation, Clock } from "lucide-react";

export const Contacts = () => {
  return (
    <section id="contacts" className="py-12 md:py-16 bg-muted/30">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Контакты</h2>
          <p className="text-muted-foreground max-w-2xl">
            Свяжитесь с нами для записи на занятия или получения дополнительной информации
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
                  Ленинградский проспект, д. 34<br />
                  Москва, 125040<br />
                  Ближайшее метро: &ldquo;Динамо&rdquo; или &ldquo;Петровский парк&rdquo;
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
                  <a href="tel:+74951234567" className="hover:text-primary transition-colors">
                    +7 (977) 967-50-01
                  </a>
                  <br />
                  <a href="tel:+79001234567" className="hover:text-primary transition-colors">
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
                  Ежедневно: 10:00 - 22:00<br />
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Navigation color="var(--brand)" className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Как добраться</h3>
                <p className="text-muted-foreground">
                  <strong>На метро:</strong> Выход из метро &ldquo;Динамо&rdquo; в сторону Ленинградский проспект, д. 34<br />
                  <strong>На машине:</strong> Парковка доступна во дворе здания
                </p>
              </div>
            </div>
          </div>

          {/* Схема проезда */}
          <div className="space-y-6">
            <div className="bg-background rounded-lg p-6 border border-brand">
              <h3 className="text-lg font-semibold mb-4">Схема проезда</h3>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>От метро &ldquo;Название станции&rdquo;:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Выйдите из метро в сторону ул. Примерная</li>
                  <li>Поверните направо и идите 200 метров</li>
                  <li>Перейдите дорогу по пешеходному переходу</li>
                  <li>Поверните налево и идите еще 100 метров</li>
                  <li>Мы находимся в здании с вывеской &ldquo;ЗВУЧИ&rdquo;</li>
                </ol>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="bg-background rounded-lg p-6 border border-brand">
              <h3 className="text-lg font-semibold mb-4">Дополнительно</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Парковка:</strong> Бесплатная парковка для клиентов
                </p>
                <p>
                  <strong>Кофе:</strong> В холле есть кофемашина и кулер с водой
                </p>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};
