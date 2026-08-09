import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Robots {
  const baseUrl = 'zvuchi-vocal.ru'

  return {
    rules: [
      {
        userAgent: 'Yandex',
        allow: '/',
        other: {
          'Clean-param': 'yabizcmpgn&ybaip&etext /',
        },
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/contest/', '/api/', '/_next/']
      },

    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
