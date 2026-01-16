import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/database'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {post.featured_image && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <Image
            src={post.featured_image}
            alt={post.title}
            width={600}
            height={340}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-x-4 text-xs">
          {formattedDate && (
            <time dateTime={post.published_at || undefined} className="text-gray-500">
              {formattedDate}
            </time>
          )}
          {post.reading_time && (
            <span className="text-gray-500">{post.reading_time} min read</span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          <Link href={`/blog/${post.slug}`} className="hover:text-primary-600 transition-colors">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
