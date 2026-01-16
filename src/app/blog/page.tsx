import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/queries'
import { BlogCard } from '@/components/ui/BlogCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, tutorials, and insights on software development and technology.',
}

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="section-padding">
      <div className="container-wrapper">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Thoughts, tutorials, and insights on software development and technology.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
