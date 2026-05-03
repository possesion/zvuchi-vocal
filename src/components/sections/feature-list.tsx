'use client';

import Link from "next/link";
import { Pagination } from 'swiper/modules';
import { FeatureListElement } from "./feature-list-element";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css/pagination';
import './style.css';

const features = [
  {
    id: 1,
    title: "Персональный подход",
    description: (
      <>
        Ваш голос - уникален. Наши занятия помогут раскрыть его потенциал, изучить техники от <Link
          href="/wiki/belting"
          className="cursor-help underline font-bold touch-manipulation"
        >
          Бэлтинга
        </Link> до <Link
          href="/wiki/drive"
          className="cursor-help underline font-bold touch-manipulation"
        >
          Драйва
        </Link> и создать свой узнаваемый стиль
      </>
    ),
    image: "/about/about-1.jpg"
  },
  {
    id: 2,
    title: "promo",
    description: <div />,
    image: ""
  },
  {
    id: 3,
    title: "Лучшие эксперты",
    description: (
      <>
        Учитесь у профессионалов – наши педагоги сертифицированы по методике{' '}
        <Link
          href="/wiki/evt"
          className="cursor-help underline font-bold touch-manipulation"
        >
          EVT
        </Link>
        {' '}и имеют многолетний опыт выступлений и преподавания.
      </>
    ),
    image: "/about/about-2.jpg"
  },
  // {
  //   id: 3,
  //   title: "Сообщество близких по духу людей",
  //   description: (
  //     <>
  //       Присоединяйтесь к нашему творческому <a className="underline text-white font-bold animate-tilt" target="_blank" href="https://t.me/zvuchivocal">сообществу</a> — где вдохновляют и поддерживают!
  //     </>
  //   ),
  //   image: "/about/about-4.jpg"
  // }
];

export const FeatureList = () => {

  return (
    <section className="bg-muted/50">
      <Swiper
        modules={[Pagination]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 3 },
        }}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
      >
        {features.map(({ id, title, description, image }) => (
          <SwiperSlide
            key={id}
            className="relative flex-shrink-0 w-full rounded-sm"
          >
            <FeatureListElement key={id} id={id} image={image} description={description} title={title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
