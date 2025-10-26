export const FeatureList = () => {
  return (
    <section className="py-8 bg-muted/50 lg:py-16">
      <div className="flex justify-center">
        <div className="px-4 text-white flex flex-col gap-6 overflow-auto md:flex-row sm:gap-2 lg:gap-4">
          <div className="bg-[url(/about/about-1.jpg)] bg-cover bg-image w-full flex flex-col justify-end items-center text-center p-6 rounded-lg shadow-sm h-[600px] sm:w-[380px]">
            <div className="h-[400px] pt-2 rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="text-xl font-bold mb-2">Персональный подход</h3>
              <p className="text-muted-foreground">
                Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал
                и создать узнаваемый стиль
              </p>
            </div>
          </div>
          <div className="h-[600px] pt-2 bg-[url(/about/about-2.jpg)] bg-cover w-full sm:w-[380px] flex flex-col items-center justify-end text-center p-6  rounded-lg shadow-sm">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="text-xl font-bold mb-2">Лучшие эксперты</h3>
              <p className="text-muted-foreground">
                Учитесь у профессионалов – наши педагоги сертифицированы по
                методике EVT (Estill Voice Training) и имеют многолетний опыт
                выступлений и преподавания.
              </p>
            </div>
          </div>
          <div className="h-[600px] pt-2 bg-[url(/about/about-4.jpg)] bg-cover sm:w-[380px] flex flex-col items-center justify-end text-center p-6 rounded-lg shadow-sm">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="text-xl font-bold mb-2">
                Сообщество близких по духу людей
              </h3>
              <p className="text-muted-foreground">
                Присоединяйтесь к нашему творческому сообществу — где вдохновляют
                и поддерживают!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
