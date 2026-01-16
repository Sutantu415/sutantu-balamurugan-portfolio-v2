import { Command } from 'commander'
import chalk from 'chalk'
import { supabase } from '../lib/supabase'
import { revalidatePath } from '../lib/revalidate'

export const aboutCommand = new Command('about')
  .description('Manage about section')

aboutCommand
  .command('show')
  .description('Show current about info')
  .action(async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error(chalk.red('Error fetching about info:'), error.message)
      return
    }

    if (!data) {
      console.log(chalk.yellow('No about info found.'))
      return
    }

    console.log(chalk.bold('\nAbout Info:'))
    console.log(chalk.cyan('Name:'), data.name)
    console.log(chalk.cyan('Title:'), data.title)
    console.log(chalk.cyan('Location:'), data.location || 'Not set')
    console.log(chalk.cyan('Bio:'), data.bio)
    console.log(chalk.cyan('Short Bio:'), data.short_bio || 'Not set')
    console.log(chalk.cyan('Avatar URL:'), data.avatar_url || 'Not set')
    console.log(chalk.cyan('Resume URL:'), data.resume_url || 'Not set')
  })

aboutCommand
  .command('update')
  .description('Update about info')
  .option('-n, --name <name>', 'Your name')
  .option('-t, --title <title>', 'Your title/role')
  .option('-b, --bio <bio>', 'Your bio')
  .option('--short-bio <shortBio>', 'Short bio for homepage')
  .option('-l, --location <location>', 'Your location')
  .option('--avatar <avatarUrl>', 'Avatar image URL')
  .option('--resume <resumeUrl>', 'Resume download URL')
  .action(async (options) => {
    const updates: Record<string, string> = {}

    if (options.name) updates.name = options.name
    if (options.title) updates.title = options.title
    if (options.bio) updates.bio = options.bio
    if (options.shortBio) updates.short_bio = options.shortBio
    if (options.location) updates.location = options.location
    if (options.avatar) updates.avatar_url = options.avatar
    if (options.resume) updates.resume_url = options.resume

    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('No updates provided. Use --help to see available options.'))
      return
    }

    // Check if about entry exists
    const { data: existing } = await supabase
      .from('about')
      .select('id')
      .eq('is_active', true)
      .single()

    let result

    if (existing) {
      result = await supabase
        .from('about')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      // Create new entry - requires name, title, and bio
      if (!updates.name || !updates.title || !updates.bio) {
        console.error(chalk.red('Creating new about entry requires --name, --title, and --bio'))
        return
      }
      result = await supabase
        .from('about')
        .insert({ ...updates, is_active: true })
    }

    if (result.error) {
      console.error(chalk.red('Error updating about:'), result.error.message)
      return
    }

    console.log(chalk.green('About info updated successfully!'))

    // Trigger revalidation
    await revalidatePath('/about')
    await revalidatePath('/')
  })
