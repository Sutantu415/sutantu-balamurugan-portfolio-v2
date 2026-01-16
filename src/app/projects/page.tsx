import type { Metadata } from 'next'
import { getProjects } from '@/lib/queries'
import { ProjectCard } from '@/components/ui/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore my portfolio of projects and work.',
}

export const revalidate = 3600

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="section-padding">
      <div className="container-wrapper">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A collection of projects I&apos;ve worked on, from personal experiments to production applications.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No projects yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
