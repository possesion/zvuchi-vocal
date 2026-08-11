import { StarIcon } from 'lucide-react'

export const actionButtonStyle = 'bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% shadow-[0_0_45px_5px] shadow-purple-900';

export const STUDIO_MOBILE_PHONE = '+7 (996) 647-60-35';
export const VALERIA_MOBILE_PHONE = '+7 (977) 967-50-01';
export const GENNADIY_MOBILE_PHONE = '+7 (985) 126-66-05';


export const SHORTS = [
    'https://rutube.ru/play/embed/ef71c434cbe70e508849c122d281010b/?p=cuO_1-tqunutUpqxNe0J0g',
    'https://rutube.ru/play/embed/a295af27816cc274f356352453b9e620/?p=dNHOC3Cg-vDXLqsngV9VTg',
    'https://rutube.ru/play/embed/ca943387a7e3b370f6ba4d93e6ba88d7/?p=H7d4KoyWjGooI7A5wkosFQ',
    'https://rutube.ru/play/embed/ba21a6c785395000803c33136d84d841/?p=OeLbwIORH4GZl3DRL4DxfQ',
    'https://rutube.ru/play/embed/593c9972643e54f8c8a267d2dd8bff55/?p=a9rFYaVC3lOormfRNbElQA',
    'https://rutube.ru/play/embed/2b85cf9a8dc4c30f1641b043407a72f1/?p=87otbUldatqPNL6S-FXrlw'
];

export const SUBSCRIPTION_LINKS = [
    {
        count: 4,
        duration: 55,
        name: 'Абонемент на месяц',
        link: 'https://auth.robokassa.ru/merchant/Invoice/8yaOatE00UCaFsN22cFM8A',
        price: 12800,
    },
    {
        count: 6,
        duration: 55,
        name: 'Абонемент на месяц',
        link: 'https://auth.robokassa.ru/merchant/Invoice/74b1AjMbQkSQ8FtjjslWnA',
        price: 18600,
    },
    {
        count: 8,
        duration: 55,
        name: 'Абонемент на месяц',
        link: 'https://auth.robokassa.ru/merchant/Invoice/0EWj8n5rlU25UCfN9B6t6A',
        price: 23900,
    },
];

export const navigationList = [
    {
        id: 1,
        text: 'Главная',
        sectionId: '/',
    },
    {
        id: 2,
        text: 'Преподаватели',
        sectionId: '/instructors',
    },
    {
        id: 3,
        text: 'Абонементы',
        sectionId: '/programs',
    },
    {
        id: 4,
        text: 'Галерея',
        sectionId: '/gallery',
        hiddenOnMobile: true,
    },
    {
        id: 5,
        text: 'База знаний',
        sectionId: '/wiki',
    },
    {
        id: 6,
        text: 'Контакты',
        sectionId: '/contacts',
    },
];

export const socials = [
    // {
    //     url: 'https://www.instagram.com/zvuchi.vocal?igsh=NG40M3dwNnQ4Z21m&utm_source=qr',
    //     src: "/socials/instagram.svg",
    //     alt: "instagram",
    // },
    {
        url: 'https://t.me/zvuchivocal',
        src: "/socials/telegram.svg",
        alt: "tg",
    },
    {
        url: 'https://vk.com/zvuchi.vocal',
        src: "/socials/vk.svg",
        alt: "vk",
    },
    {
        url: 'https://www.tiktok.com/@zvuchi.vocal',
        src: "/socials/tiktok.svg",
        alt: "tiktok",
    },
]

export const contacts = [
    {
        url: 'https://t.me/zvuchiTG',
        src: "/socials/telegram.svg",
        alt: "tg",
    },
    {
        url: 'https://vk.com/zvuchi.vocal',
        src: "/socials/vk.svg",
        alt: "vk",
    },
    {
        url: 'https://max.ru/u/f9LHodD0cOLUX61zEOL-D_VBmWbuLAmuVmelJn3yWP_Zpm8YDeFQvj2i7Z0',
        src: "/socials/max.svg",
        alt: "max",
    },
]


export const FAQ_ITEMS = [
    {
        question: 'Могу ли я прийти к вам, если никогда не занимался музыкой / вокалом?',
        answer: 'Конечно! Больше половины наших студентов никогда не учились в музыкальной школе. Наши педагоги помогут научиться слушать и слышать, попадать в ноты, понимать музыкальную грамоту без сложных объяснений. Всё, что вам нужно — немного усердия и трудолюбия, а наша задача — подобрать классного наставника.',
    },
    {
        question: 'Что будет на пробном занятии?',
        answer: 'Наше пробное занятие длится 50 минут. За это время вы успеете пообщаться с педагогом, задать вопросы, понять и оценить свой уровень подготовки. А педагог расскажет всё о студии и подходе в обучении.',
    },
    {
        question: 'Через сколько времени я научусь петь? Видел, что в рекламе музыкальных школ часто обещают научить петь за 1-2 месяца.',
        answer: 'Мы не даём обещаний научить петь за пару месяцев. К сожалению, волшебной таблетки в исполнительском искусстве ещё не придумали. Конечно, многое зависит от трудолюбия и свободного времени для выполнения домашних заданий, а также от начальных данных. Что вы точно успеете за 1-2 месяца? Освоить основы вокальной техники и базу музыкальной теории, закончить первую песню и по желанию выступить на концерте или квартирнике. Но мы точно знаем: чем дальше, тем интереснее.',
    },
    {
        question: 'Как к вам записаться? Как происходит набор?',
        answer: 'Набор в студию открыт постоянно. Оставляйте заявку на сайте или напишите нам в Telegram — мы свяжемся, расспросим о предпочтениях, подберём педагога и пригласим на пробное занятие.',
    },
    {
        question: 'Как проходят занятия?',
        answer: 'У каждого преподавателя своя методика. Обычно занятия состоят из разминки, специально подобранных упражнений и тренировки вашей песни или произведения. Также на занятиях вы изучите музыкальную теорию, поймёте как работает голосовой аппарат. Мы считаем, что самое важное здесь то, что обучение должно быть комфортным процессом, который мы создаём для каждого ученика.',
    },
    {
        question: 'Сколько длится обучение?',
        answer: 'Обучение вокалу — индивидуальный процесс. Поэтому у нас есть студенты, которые занимаются и 6 месяцев, и больше 3 лет. Всё зависит от целей. Для каждого студента мы подбираем индивидуальную программу.',
    },
    {
        question: 'Какие песни мы будем петь и какую музыку играть?',
        answer: 'Мы подстраиваемся под ваши предпочтения, поэтому направление вы выберете сами: от джаза до рока, соула или поп-музыки. Наша задача — помочь раскрыть именно ваши способности и индивидуальность, а также подобрать педагога-наставника, которому симпатичны те же стили, что и вам.',
    },
    {
        question: 'Как часто проходят концерты и квартирники?',
        answer: 'Концерты проходят раз в 3 месяца. На концерте может выступить любой желающий студент. Мы всегда стараемся подобрать крутую и интересную площадку. Педагоги также устраивают небольшие квартирники, которые помогают побороть стеснение, потренировать выступление и пообщаться с единомышленниками.',
    },
];