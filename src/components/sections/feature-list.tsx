import { evtTooltipContent } from "@/app/constants";
import { Tooltip } from "radix-ui";

// .TooltipContent {
// 	border-radius: 4px;
// 	padding: 10px 15px;
// 	font-size: 15px;
// 	line-height: 1;
// 	color: var(--violet-11);
// 	background-color: white;
// 	box-shadow:
// 		hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
// 		hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
// 	user-select: none;
// 	animation-duration: 400ms;
// 	animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
// 	will-change: transform, opacity;
// }
export const TooltipDemo = () => (
  <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>

    <Tooltip.Root delayDuration={0}>
      <Tooltip.Trigger className="pr-1 cursor-help font-bold text-brand hover:text-white">EVT</Tooltip.Trigger>
      <Tooltip.Content className="px-2 py-3 rounded-sm text-brand bg-white max-w-60 data-[state='delayed-open']:animate-flip-in-y data-[state='closed']:animate-flip-out-y">{evtTooltipContent}</Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
);
// Компонент Tooltip
// const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
//   return (
//     <div className="group relative inline-block">
//       {children}
//       <div className="invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
//         {content}
//         <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900"></div>
//       </div>
//     </div>
//   );
// };

export const FeatureList = () => {
  return (
    <section className="bg-muted/50 py-8 lg:py-16">
      <div className="flex justify-center">
        <div className="flex flex-col gap-6 overflow-auto text-white sm:gap-2 md:flex-row lg:gap-4">
          <article className="flex h-[600px] w-full flex-col items-center justify-end rounded-lg bg-[url(/about/about-1.jpg)] bg-cover bg-image p-6 text-center shadow-sm sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent pt-2">
              <h3 className="mb-2 text-xl font-bold">Персональный подход</h3>
              <p className="px-1 text-muted-foreground">
                Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал, изучить техники от <b>Бэлтинга</b> до <b>Драйва </b> и создать свой узнаваемый стиль
              </p>
            </div>
          </article>
          <article className="flex h-[600px] w-full flex-col items-center justify-end rounded-lg bg-[url(/about/about-2.jpg)] bg-cover p-6 text-center shadow-sm pt-2 sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="mb-2 text-xl font-bold">Лучшие эксперты</h3>
              <p className="px-1 text-muted-foreground">
                Учитесь у профессионалов – наши педагоги сертифицированы по
                методике{' '}
                <TooltipDemo />
                и имеют многолетний опыт выступлений и преподавания.
              </p>
            </div>
          </article>
          <article className="flex h-[600px] flex-col items-center justify-end rounded-lg bg-[url(/about/about-4.jpg)] bg-cover p-6 text-center shadow-sm pt-2 sm:w-[380px]">
            <div className="h-[400px] rounded-md bg-linear-to-b from-black/70 to-transparent">
              <h3 className="mb-2 text-xl font-bold">
                Сообщество близких по духу людей
              </h3>
              <p className="px-1 text-muted-foreground">
                Присоединяйтесь к нашему творческому <a className="text-brand font-bold animate-tilt hover:text-white" target="_blank" href="https://t.me/zvuchivocal">сообществу</a> — где вдохновляют
                и поддерживают!
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
