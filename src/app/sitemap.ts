import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { getAllStateParams } from '@/lib/state-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mnrega-mah.vercel.app'
  
  // Get all states
  const states = getAllStateParams()
  
  // Get all districts
  const districts = await prisma.district.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  })
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
  
  // State pages
  const statePages: MetadataRoute.Sitemap = states.map((state) => ({
    url: `${baseUrl}/state/${state.stateCode}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  // District pages
  const districtPages: MetadataRoute.Sitemap = districts.map((district) => ({
    url: `${baseUrl}/district/${district.id}`,
    lastModified: district.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...statePages, ...districtPages]
}
