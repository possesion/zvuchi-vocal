export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://zvuchi-vocal.ru/#organization',
    name: 'ЗВУЧИ - Вокальная студия',
    alternateName: ['Звучи', 'Студия вокала Звучи'],
    url: 'https://zvuchi-vocal.ru',
    logo: {
        '@type': 'ImageObject',
        url: 'https://zvuchi-vocal.ru/zvuchi-cropped.png',
        width: 224,
        height: 64,
        caption: 'Логотип вокальной студии ЗВУЧИ',
    },
    image: {
        '@type': 'ImageObject',
        url: 'https://zvuchi-vocal.ru/main-image.jpg',
        width: 1200,
        height: 630,
        caption: 'ЗВУЧИ - Вокальная студия в Москве',
    },
    description:
        'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Москва',
        addressCountry: 'RU',
    },
    telephone: '+7 (977) 967-50-01',
    email: 'info@zvuchi-vocal.ru',
    sameAs: [
        'https://vk.com/zvuchi.vocal',
        'https://t.me/zvuchi_vocal',
        'https://rutube.ru/channel/44925959/',
    ],
    priceRange: '₽₽',
};

export const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://zvuchi-vocal.ru/#localbusiness',
    name: 'ЗВУЧИ - Вокальная студия',
    image: 'https://zvuchi-vocal.ru/main-image.jpg',
    description:
        'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Москва',
        addressCountry: 'RU',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 55.755826,
        longitude: 37.6173,
    },
    url: 'https://zvuchi-vocal.ru',
    telephone: '+7 (977) 967-50-01',
    priceRange: '₽₽',
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '10:00',
            closes: '22:00',
        },
    ],
};

export const educationalOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': 'https://zvuchi-vocal.ru/#educational',
    name: 'ЗВУЧИ - Вокальная студия',
    description:
        'Профессиональные уроки вокала в Москве. Индивидуальный подход, опытные педагоги, методика EVT.',
    url: 'https://zvuchi-vocal.ru',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Москва',
        addressCountry: 'RU',
    },
    telephone: '+7 (977) 967-50-01',
};

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
    })),
});
