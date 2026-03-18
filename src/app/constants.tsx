import { StarIcon } from 'lucide-react'

export const actionButtonStyle = 'bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% shadow-[0_0_45px_5px] shadow-purple-900';

export const evtTooltipTitle = 'Estill Voice Training ';

export const evtTooltipContent = '(EVT) — это научная модель развития голоса, разработанная певицей и исследователем Джо Эстилл, которая учит сознательному контролю над структурами голосового аппарата для достижения гибкости, силы и здоровья голоса в любом стиле';

export const beltingDescription = 'Вокальная техника пения высоких нот с использованием грудного регистра, обеспечивающая мощное, объёмное и напористое звучание';

export const driveDescription = 'Приём вокального исполнения (пения), при котором к чистому звуку извлекаемому горловым образом (голосом), примешивается известная доля другого звука, нередко представляющего собой немузыкальный звук';

export const STUDIO_MOBILE_PHONE = '+7 (977) 967-50-01';

export const SHORTS = [
    'https://rutube.ru/play/embed/ca943387a7e3b370f6ba4d93e6ba88d7/?p=H7d4KoyWjGooI7A5wkosFQ',
    'https://rutube.ru/play/embed/ba21a6c785395000803c33136d84d841/?p=OeLbwIORH4GZl3DRL4DxfQ',
    'https://rutube.ru/play/embed/a295af27816cc274f356352453b9e620/?p=dNHOC3Cg-vDXLqsngV9VTg',
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
export const programs = [
    // {
    //     number: '',
    //     title: 'Разовое посещение',
    //     description: 'Открой для себя новое хобби',
    //     features: [
    //         'Длительность урока - 55 минут',
    //     ],
    //     price: '3890₽',
    // },
    {
        icon: <StarIcon
            color="var(--brand)"
            // color="orange" 
            // fill='yellow'
            className="h-10 w-10"
        />,
        title: 'Базовый',
        description: 'Идеально для тех, кто только начинает свой путь в вокале',
        features: [
            'Количество занятий – 4 (месяц)',
            // 'Длительность урока - 55 минут',
            // 'Бесплатная заморозка абонемента на 1 неделю',
        ],
        number: 1,
        price: '12800₽',
    },
    {
        icon: (
            <div className="flex flex-col gap-1">
                {[1, 2].map((id) => (
                    <StarIcon
                        key={id}
                        color="var(--brand)"
                        className="h-8 w-8"
                    />
                ))}
            </div>
        ),
        number: 2,
        title: 'Продвинутый',
        description: 'Подходит для получения и закрепления новых знаний',
        features: [
            'Количество занятий – 6 (месяц)',
            // 'Длительность урока - 55 минут',
            // 'Бесплатная заморозка абонемента на 1 неделю',
        ],
        price: '18600₽',
    },
    {
        icon: (
            <div className="flex flex-col gap-1">
                {[1, 2, 3].map((id) => (
                    <StarIcon
                        key={id}
                        color="var(--brand)"
                        className="h-8 w-8"
                    />
                ))}
            </div>
        ),
        title: 'Эффективный',
        description: 'Отточите свои навыки до совершенства!',
        features: [
            'Количество занятий – 8 (месяц)',
            // 'Длительность урока - 55 минут',
            // 'Бесплатная заморозка абонемента на 1 неделю',
        ],
        number: 3,
        price: '23900₽',
    },
]

export const instructors = [
    {
        name: 'Валерия Ковшова',
        specialty: ['Вокал'],
        feature: 'Джазовая импровизация, мелизматика и экстрим-вокал',
        bio: (
            <div className='font-semibold'>
                <li><span className='mr-2'>🎓</span>Образование: МГКИ (эстрадно-джазовый вокал)</li>
                <li>
                    <span className='mr-2'>⭐</span>Повышала квалификацию на курсах{' '}
                    <span
                        className="cursor-help rounded-sm bg-brand/20 px-2 py-1 font-semibold text-brand transition-all duration-200 hover:bg-brand/30 hover:text-white"
                        title="Estill Voice Training"
                    >
                        EVT
                    </span>{' '}
                    и у Дарьи Манаковой
                </li>
                <li><span className='mr-2'>🎤</span>Солистка джаз-банда Extra Time Jazz Band</li>
                <li><span className='mr-2'>📚</span>Опыт преподавания: 6 лет</li>
            </div>
        ),
        experience: '6 лет',
        image: '/valeria/lera.PNG?height=300&width=300',
        video: 'https://s3.twcstorage.ru/dd3d1966-zvuchi-media/mentors/IMG_7581.mp4',
    },
    {
        name: 'Мария Биттер',
        specialty: ['Вокал'],
        feature: 'Бэлтинг, Микст и вокальные фишки',
        experience: '10 лет',
        bio: (
            <div className='font-semibold'>
                <li><span className='mr-2'>🎓</span>Высшее муз. образование (МПГУ)</li>
                <li><span className='mr-2'>⭐</span>Курсы Estill Voice</li>
                <li><span className='mr-2'>⭐</span>Мастер-классы у Дарьи Манаковой и Ольги Кляйн</li>
                <li><span className='mr-2'>🎙️</span>Организую концерты для учеников!</li>
                <li><span className='mr-2'>📚</span>Опыт преподавания: 10 лет</li>
            </div>
        ),
        image: '/maria/card.jpg?height=300&width=300',
        video: 'https://s3.twcstorage.ru/dd3d1966-zvuchi-media/mentors/IMG_8697.mp4',

    },
    {
        name: 'Мария Жукова',
        specialty: ['Вокал', 'Фортепиано'],
        feature: 'Техники плотных высоких нот, этно мелизматика и душевное отношение к голосу',
        experience: '4 года',
        bio: (
            <div className='font-semibold'>
                {/* Преподаватель по вокалу, фортепиано и сольфеджио  студии ЗВУЧИ */}
                <li><span className='mr-2'>🎓</span>Образование МПГУ эстрадно-джазовый вокал и фортепиано</li>
                <li><span className='mr-2'>⭐</span>
                    Сверхсила: Техники плотных высоких нот, этно мелизматика и душевное отношение к голосу
                </li>
            </div>
        ),
        image: '/maria-jukova/jukova.png?height=300&width=300',
        video: 'https://s3.twcstorage.ru/dd3d1966-zvuchi-media/mentors/IMG_1304.mp4',
    },
    {
        name: 'Элина Губкина',
        specialty: ['Гитара'],
        feature: 'Огненные гитарные соляки',
        experience: '5 лет',
        bio: (
            <div className='font-semibold'>
                <li><span className='mr-2'>🎓</span>Образование МПГУ эстрадно-джазовый вокал и фортепиано</li>
                {/* <li><span className='mr-2'>🎤</span>Мастер-классы джазовых музыкантов Алины Енгибарян, Маринэ Григорян, Евгения Лебедева, Антона Чекурова</li> */}
                <li><span className='mr-2'>📚</span>Опыт преподавания: 5 лет</li>
            </div>
        ),
        image: '/elina/elina.jpeg?height=300&width=300',
        video: '',
    },
]

export const testimonials = [
    {
        name: 'Jessica T.',
        program: 'Advanced Vocal Techniques',
        quote: 'After just six months at Harmony, I landed my first professional singing gig. The instructors truly care about your development and push you to reach your full potential.',
        image: '/placeholder.svg?height=100&width=100',
    },
    {
        name: 'Marcus L.',
        program: 'Performance Coaching',
        quote: 'The performance coaching program transformed my stage presence. I went from being terrified of performing to confidently taking center stage at competitions.',
        image: '/placeholder.svg?height=100&width=100',
    },
    {
        name: 'Aisha K.',
        program: 'Beginner Vocal Training',
        quote: "I started with zero singing experience, and now I'm performing with my church choir. The patient, supportive environment made all the difference in my journey.",
        image: '/placeholder.svg?height=100&width=100',
    },
]

export const events = [
    {
        day: '15',
        month: 'Jun',
        title: 'Summer Showcase Concert',
        time: 'Saturday, 7:00 PM',
        description:
            'Join us for an evening of performances by our talented students across all programs.',
    },
    {
        day: '22',
        month: 'Jun',
        title: 'Vocal Health Workshop',
        time: 'Saturday, 2:00 PM',
        description:
            'Learn essential techniques to maintain vocal health and prevent strain with our guest speech pathologist.',
    },
    {
        day: '05',
        month: 'Jul',
        title: 'Master Class with Grammy Winner',
        time: 'Tuesday, 6:00 PM',
        description:
            'A rare opportunity to learn from award-winning vocalist James Anderson in an intimate setting.',
    },
    {
        day: '18',
        month: 'Jul',
        title: 'Recording Studio Workshop',
        time: 'Thursday, 5:30 PM',
        description:
            'Discover professional techniques for recording vocals in a studio environment.',
    },
]

export const navigationList = [
    {
        id: 1,
        text: 'О студии',
        sectionId: '/about',
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
    // {
    //     id: 5,
    //     text: 'База знаний',
    //     sectionId: '/wiki',
    //     hiddenOnMobile: true,
    // },
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
        url: 'https://www.tiktok.com/@zvuchi.vocal?_t=ZS-8yqbaCZDVqb&_r=1',
        src: "/socials/tiktok.svg",
        alt: "tiktok",
    },
]
