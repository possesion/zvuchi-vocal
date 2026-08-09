import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Robots {
  const baseUrl = 'zvuchi-vocal.ru'

  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: ['/contest/', '/api/', '/_next/']
        }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
