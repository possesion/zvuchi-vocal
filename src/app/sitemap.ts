import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zvuchi-vocal.ru'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // {
    //   url: `${baseUrl}/contest`,
    //   lastModified: new Date(),
    //   changeFrequency: 'daily',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/contest/result`,
    //   lastModified: new Date(),
    //   changeFrequency: 'daily',
    //   priority: 0.6,
    // },
  ]
}