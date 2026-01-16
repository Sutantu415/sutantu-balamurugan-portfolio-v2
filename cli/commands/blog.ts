import { Command } from 'commander'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import { supabase } from '../lib/supabase'
import { revalidatePath } from '../lib/revalidate'

export const blogCommand = new Command('blog')
  .description('Manage blog posts')

blogCommand
  .command('list')
  .description('List all blog posts')
  .option('--featured', 'Show only featured posts')
  .option('--drafts', 'Show only drafts')
  .option('--all', 'Show all posts including drafts')
  .action(async (options) => {
    let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false })

    if (options.featured) {
      query = query.eq('is_featured', true)
    }

    if (options.drafts) {
      query = query.eq('is_published', false)
    } else if (!options.all) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error(chalk.red('Error fetching posts:'), error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log(chalk.yellow('No blog posts found.'))
      return
    }

    console.log(chalk.bold(`\nBlog Posts (${data.length}):\n`))
    data.forEach((post, index) => {
      const status = []
      if (post.is_featured) status.push(chalk.yellow('featured'))
      if (!post.is_published) status.push(chalk.red('draft'))

      const date = post.published_at
        ? new Date(post.published_at).toLocaleDateString()
        : 'Not published'

      console.log(
        `${index + 1}. ${chalk.cyan(post.title)} ${chalk.gray(`(${post.slug})`)} ${status.join(' ')}`
      )
      console.log(`   ${chalk.gray(date)} • ${post.reading_time || '?'} min read`)
      if (post.tags?.length) {
        console.log(`   ${chalk.blue(post.tags.join(', '))}`)
      }
      console.log()
    })
  })

blogCommand
  .command('create')
  .description('Create a new blog post')
  .requiredOption('-s, --slug <slug>', 'URL slug (unique)')
  .requiredOption('-t, --title <title>', 'Post title')
  .option('-c, --content <content>', 'Post content (or use --file)')
  .option('-f, --file <path>', 'Read content from markdown file')
  .option('-e, --excerpt <excerpt>', 'Short excerpt')
  .option('--image <url>', 'Featured image URL')
  .option('--tags <tags...>', 'Tags (space-separated)')
  .option('--featured', 'Mark as featured')
  .option('--publish', 'Publish immediately')
  .action(async (options) => {
    let content = options.content

    if (options.file) {
      const filePath = path.resolve(process.cwd(), options.file)
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${filePath}`))
        return
      }
      content = fs.readFileSync(filePath, 'utf-8')
    }

    if (!content) {
      console.error(chalk.red('Content is required. Use --content or --file'))
      return
    }

    // Estimate reading time (roughly 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    const post = {
      slug: options.slug,
      title: options.title,
      content,
      excerpt: options.excerpt || null,
      featured_image: options.image || null,
      tags: options.tags || [],
      is_featured: options.featured || false,
      is_published: options.publish || false,
      reading_time: readingTime,
      published_at: options.publish ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase.from('blog_posts').insert(post).select().single()

    if (error) {
      console.error(chalk.red('Error creating post:'), error.message)
      return
    }

    console.log(chalk.green(`Blog post "${data.title}" created successfully!`))
    console.log(chalk.gray(`Slug: ${data.slug}`))
    console.log(chalk.gray(`Status: ${data.is_published ? 'Published' : 'Draft'}`))

    if (data.is_published) {
      await revalidatePath('/blog')
      await revalidatePath('/')
    }
  })

blogCommand
  .command('publish <slug>')
  .description('Publish a draft post')
  .action(async (slug) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error publishing post:'), error.message)
      return
    }

    console.log(chalk.green(`Post "${slug}" published successfully!`))

    await revalidatePath('/blog')
    await revalidatePath(`/blog/${slug}`)
    await revalidatePath('/')
  })

blogCommand
  .command('unpublish <slug>')
  .description('Unpublish a post')
  .action(async (slug) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ is_published: false })
      .eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error unpublishing post:'), error.message)
      return
    }

    console.log(chalk.green(`Post "${slug}" unpublished!`))

    await revalidatePath('/blog')
    await revalidatePath('/')
  })

blogCommand
  .command('update <slug>')
  .description('Update a blog post')
  .option('-t, --title <title>', 'Post title')
  .option('-c, --content <content>', 'Post content')
  .option('-f, --file <path>', 'Read content from markdown file')
  .option('-e, --excerpt <excerpt>', 'Short excerpt')
  .option('--image <url>', 'Featured image URL')
  .option('--tags <tags...>', 'Tags (space-separated)')
  .option('--featured <boolean>', 'Featured status (true/false)')
  .action(async (slug, options) => {
    const updates: Record<string, unknown> = {}

    if (options.title) updates.title = options.title
    if (options.excerpt) updates.excerpt = options.excerpt
    if (options.image) updates.featured_image = options.image
    if (options.tags) updates.tags = options.tags
    if (options.featured !== undefined) updates.is_featured = options.featured === 'true'

    if (options.file) {
      const filePath = path.resolve(process.cwd(), options.file)
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${filePath}`))
        return
      }
      updates.content = fs.readFileSync(filePath, 'utf-8')
    } else if (options.content) {
      updates.content = options.content
    }

    if (updates.content) {
      const wordCount = (updates.content as string).split(/\s+/).length
      updates.reading_time = Math.ceil(wordCount / 200)
    }

    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('No updates provided.'))
      return
    }

    const { error } = await supabase.from('blog_posts').update(updates).eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error updating post:'), error.message)
      return
    }

    console.log(chalk.green(`Post "${slug}" updated successfully!`))

    await revalidatePath('/blog')
    await revalidatePath(`/blog/${slug}`)
  })

blogCommand
  .command('delete <slug>')
  .description('Delete a blog post')
  .action(async (slug) => {
    const { error } = await supabase.from('blog_posts').delete().eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error deleting post:'), error.message)
      return
    }

    console.log(chalk.green(`Post "${slug}" deleted successfully!`))

    await revalidatePath('/blog')
    await revalidatePath('/')
  })
