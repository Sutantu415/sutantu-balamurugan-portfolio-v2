import Link from 'next/link'
import Image from 'next/image'
import { getAbout, getProjects, getBlogPosts, getSkillsByCategory } from '@/lib/queries'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { BlogCard } from '@/components/ui/BlogCard'
import { SkillBadge } from '@/components/ui/SkillBadge'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const [about, featuredProjects, featuredPosts, skillsByCategory] = await Promise.all([
    getAbout(),
    getProjects(true),
    getBlogPosts(true),
    getSkillsByCategory(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="container-wrapper section-padding">
          <div className="mx-auto max-w-3xl text-center">
            {about?.avatar_url && (
              <div className="mx-auto mb-8 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
                <Image
                  src={about.avatar_url}
                  alt={about.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {about?.name || 'Welcome'}
            </h1>
            <p className="mt-4 text-xl text-primary-600 font-medium">
              {about?.title || 'Developer & Creator'}
            </p>
            <p className="mt-6 text-lg text-gray-600 text-balance">
              {about?.short_bio || about?.bio || 'Building digital experiences that make a difference.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/projects"
                className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
              >
                View Projects
              </Link>
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="section-padding">
          <div className="container-wrapper">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Projects</h2>
              <Link
                href="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-wrapper">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Skills & Technologies
            </h2>
            <div className="mt-12 space-y-8">
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
        </section>
      )}

      {/* Featured Blog Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="section-padding">
          <div className="container-wrapper">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Latest Articles</h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-primary-600">
        <div className="container-wrapper text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Interested in working together?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            I&apos;m always open to discussing new projects and opportunities.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100 transition-colors"
          >
            Let&apos;s Talk
          </Link>
        </div>
      </section>
    </div>
  )
}
