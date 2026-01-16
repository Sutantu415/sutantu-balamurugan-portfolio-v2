import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAbout, getSkillsByCategory } from '@/lib/queries'
import { SkillBadge } from '@/components/ui/SkillBadge'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me, my background, and what I do.',
}

export const revalidate = 3600

export default async function AboutPage() {
  const [about, skillsByCategory] = await Promise.all([
    getAbout(),
    getSkillsByCategory(),
  ])

  if (!about) {
    return (
      <div className="container-wrapper section-padding">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">About Me</h1>
          <p className="mt-4 text-gray-600">Content coming soon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding">
      <div className="container-wrapper">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
            {about.avatar_url && (
              <div className="mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl">
                <Image
                  src={about.avatar_url}
                  alt={about.name}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {about.name}
            </h1>
            <p className="mt-3 text-xl text-primary-600 font-medium">{about.title}</p>
            {about.location && (
              <p className="mt-2 text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {about.location}
                </span>
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="mt-12 prose-custom mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {about.bio}
            </p>
          </div>

          {/* Resume Link */}
          {about.resume_url && (
            <div className="mt-8 text-center">
              <Link
                href={about.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </Link>
            </div>
          )}

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Skills & Expertise
              </h2>
              <div className="space-y-8">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{category}</h3>
                    <div className="flex flex-wrap gap-3">
                      {skills.map((skill) => (
                        <SkillBadge key={skill.id} skill={skill} showProficiency />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
