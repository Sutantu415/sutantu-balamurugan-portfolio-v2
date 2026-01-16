import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {project.featured_image && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <Image
            src={project.featured_image}
            alt={project.title}
            width={600}
            height={340}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          <Link href={`/projects/${project.slug}`} className="hover:text-primary-600 transition-colors">
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">
          {project.description}
        </p>
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
