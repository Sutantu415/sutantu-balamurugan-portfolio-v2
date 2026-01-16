import { Command } from 'commander'
import chalk from 'chalk'
import { supabase } from '../lib/supabase'
import { revalidatePath } from '../lib/revalidate'

export const projectsCommand = new Command('projects')
  .description('Manage projects')

projectsCommand
  .command('list')
  .description('List all projects')
  .option('--featured', 'Show only featured projects')
  .option('--all', 'Show all projects including unpublished')
  .action(async (options) => {
    let query = supabase.from('projects').select('*').order('display_order')

    if (options.featured) {
      query = query.eq('is_featured', true)
    }

    if (!options.all) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error(chalk.red('Error fetching projects:'), error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log(chalk.yellow('No projects found.'))
      return
    }

    console.log(chalk.bold(`\nProjects (${data.length}):\n`))
    data.forEach((project, index) => {
      const status = []
      if (project.is_featured) status.push(chalk.yellow('featured'))
      if (!project.is_published) status.push(chalk.red('draft'))

      console.log(
        `${index + 1}. ${chalk.cyan(project.title)} ${chalk.gray(`(${project.slug})`)} ${status.join(' ')}`
      )
      console.log(`   ${chalk.gray(project.description.substring(0, 100))}${project.description.length > 100 ? '...' : ''}`)
      if (project.tech_stack?.length) {
        console.log(`   ${chalk.blue(project.tech_stack.join(', '))}`)
      }
      console.log()
    })
  })

projectsCommand
  .command('create')
  .description('Create a new project')
  .requiredOption('-s, --slug <slug>', 'URL slug (unique)')
  .requiredOption('-t, --title <title>', 'Project title')
  .requiredOption('-d, --description <description>', 'Short description')
  .option('--long-description <text>', 'Long description')
  .option('--image <url>', 'Featured image URL')
  .option('--live <url>', 'Live demo URL')
  .option('--github <url>', 'GitHub repository URL')
  .option('--tech <tech...>', 'Tech stack (space-separated)')
  .option('--featured', 'Mark as featured')
  .option('--draft', 'Save as draft (not published)')
  .option('--order <number>', 'Display order', '0')
  .action(async (options) => {
    const project = {
      slug: options.slug,
      title: options.title,
      description: options.description,
      long_description: options.longDescription || null,
      featured_image: options.image || null,
      live_url: options.live || null,
      github_url: options.github || null,
      tech_stack: options.tech || [],
      is_featured: options.featured || false,
      is_published: !options.draft,
      display_order: parseInt(options.order, 10),
    }

    const { data, error } = await supabase.from('projects').insert(project).select().single()

    if (error) {
      console.error(chalk.red('Error creating project:'), error.message)
      return
    }

    console.log(chalk.green(`Project "${data.title}" created successfully!`))
    console.log(chalk.gray(`Slug: ${data.slug}`))

    await revalidatePath('/projects')
    await revalidatePath('/')
  })

projectsCommand
  .command('update <slug>')
  .description('Update a project')
  .option('-t, --title <title>', 'Project title')
  .option('-d, --description <description>', 'Short description')
  .option('--long-description <text>', 'Long description')
  .option('--image <url>', 'Featured image URL')
  .option('--live <url>', 'Live demo URL')
  .option('--github <url>', 'GitHub repository URL')
  .option('--tech <tech...>', 'Tech stack (space-separated)')
  .option('--featured <boolean>', 'Featured status (true/false)')
  .option('--published <boolean>', 'Published status (true/false)')
  .option('--order <number>', 'Display order')
  .action(async (slug, options) => {
    const updates: Record<string, unknown> = {}

    if (options.title) updates.title = options.title
    if (options.description) updates.description = options.description
    if (options.longDescription) updates.long_description = options.longDescription
    if (options.image) updates.featured_image = options.image
    if (options.live) updates.live_url = options.live
    if (options.github) updates.github_url = options.github
    if (options.tech) updates.tech_stack = options.tech
    if (options.featured !== undefined) updates.is_featured = options.featured === 'true'
    if (options.published !== undefined) updates.is_published = options.published === 'true'
    if (options.order) updates.display_order = parseInt(options.order, 10)

    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('No updates provided.'))
      return
    }

    const { error } = await supabase.from('projects').update(updates).eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error updating project:'), error.message)
      return
    }

    console.log(chalk.green(`Project "${slug}" updated successfully!`))

    await revalidatePath('/projects')
    await revalidatePath(`/projects/${slug}`)
    await revalidatePath('/')
  })

projectsCommand
  .command('delete <slug>')
  .description('Delete a project')
  .action(async (slug) => {
    const { error } = await supabase.from('projects').delete().eq('slug', slug)

    if (error) {
      console.error(chalk.red('Error deleting project:'), error.message)
      return
    }

    console.log(chalk.green(`Project "${slug}" deleted successfully!`))

    await revalidatePath('/projects')
    await revalidatePath('/')
  })
