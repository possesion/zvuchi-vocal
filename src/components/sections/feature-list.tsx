export const FeatureList = () => {
  return (
    <section className="bg-muted/50 py-8 lg:py-16">
      <div className="flex justify-center">
        <div className="flex flex-col gap-6 overflow-auto text-white sm:gap-2 md:flex-row lg:gap-4">
          <article className="flex h-[600px] w-full flex-col items-center justify-end rounded-lg bg-[url(/about/about-1.jpg)] bg-cover bg-image p-6 text-center shadow-sm sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent pt-2">
              <h3 className="mb-2 text-xl font-bold">Персональный подход</h3>
              <p className="px-1 text-muted-foreground">
                Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал
                и создать узнаваемый стиль
              </p>
            </div>
          </article>
          <article className="flex h-[600px] w-full flex-col items-center justify-end rounded-lg bg-[url(/about/about-2.jpg)] bg-cover p-6 text-center shadow-sm pt-2 sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="mb-2 text-xl font-bold">Лучшие эксперты</h3>
              <p className="px-1 text-muted-foreground">
                Учитесь у профессионалов – наши педагоги сертифицированы по
                методике EVT (Estill Voice Training) и имеют многолетний опыт
                выступлений и преподавания.
              </p>
            </div>
          </article>
          <article className="flex h-[600px] flex-col items-center justify-end rounded-lg bg-[url(/about/about-4.jpg)] bg-cover p-6 text-center shadow-sm pt-2 sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="mb-2 text-xl font-bold">
                Сообщество близких по духу людей
              </h3>
              <p className="px-1 text-muted-foreground">
                Присоединяйтесь к нашему творческому <a className="font-bold animate-tilt hover:text-brand" target="_blank" href="https://t.me/zvuchivocal">сообществу</a> — где вдохновляют
                и поддерживают!
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
