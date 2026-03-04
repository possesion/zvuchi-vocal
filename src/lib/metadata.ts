import { Metadata } from 'next';

const SITE_URL = 'https://zvuchi-vocal.ru';
const SITE_NAME = 'ЗВУЧИ - Вокальная студия';

export const defaultMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} | Уроки вокала в Москве`,
        template: `%s | ${SITE_NAME}`,
    },
    description: 'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT. Голос изменится после первого занятия!',
    keywords: [
        'вокал',
        'уроки вокала',
        'вокальная студия',
        'пение',
        'школа вокала для взрослых',
        'школа вокала москва',
        'уроки пения',
        'вокальная школа',
        'обучение вокалу',
        'курсы вокала',
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: 'Казанцев Геннадий Викторович',
    publisher: SITE_NAME,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    manifest: `${SITE_URL}/manifest.json`,
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        yandex: '7e59eba73c6a74d8',
        google: 'G-80QM6W2Z28',
    },
    category: 'Education',
    classification: 'Образование, Музыка, Вокал',
    other: {
        'yandex-verification': '7e59eba73c6a74d8',
        'geo.region': 'RU-MOW',
        'geo.placename': 'Москва',
        'geo.position': '55.755826;37.617300',
        'ICBM': '55.755826, 37.617300',
    },
};

export function generatePageMetadata({
    title,
    description,
    path,
    images,
    keywords,
}: {
    title: string;
    description: string;
    path: string;
    images?: Array<{ url: string; width: number; height: number; alt: string }>;
    keywords?: string[];
}): Metadata {
    const url = `${SITE_URL}${path}`;

    return {
        title,
        description,
        keywords: keywords || defaultMetadata.keywords,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'ru_RU',
            url,
            siteName: SITE_NAME,
            images: images || [
                {
                    url: '/main-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${SITE_NAME} - ${title}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images?.[0]?.url || '/main-image.jpg',
        },
    };
}
