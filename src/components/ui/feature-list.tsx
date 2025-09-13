import { AwardIcon, Users2Icon, BookUser } from "lucide-react";

export const FeatureList = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          {/* bg-background brightness-97  */}
          <div className="bg-secondaryz w-[380px] flex flex-col items-center text-center p-6 rounded-lg shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookUser color="var(--brand)" className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Персональный подход</h3>
            <p className="text-muted-foreground">
              Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал
              и создать узнаваемый стиль
            </p>
          </div>
          <div className=" w-[380px] flex flex-col items-center text-center p-6 bg-secondaryz rounded-lg shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <AwardIcon color="var(--brand)" className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Лучшие эксперты</h3>
            <p className="text-muted-foreground">
              Учитесь у профессионалов – наши педагоги сертифицированы по
              методике EVT (Estill Voice Training) и имеют многолетний опыт
              выступлений и преподавания.
            </p>
          </div>
          <div className=" w-[380px] flex flex-col items-center text-center p-6 bg-secondaryz rounded-lg shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users2Icon color="var(--brand)" className="h-8 w-8" />
            </div>
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
    </section>
  );
};
