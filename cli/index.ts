#!/usr/bin/env node
import { Command } from 'commander'
import { aboutCommand } from './commands/about'
import { projectsCommand } from './commands/projects'
import { blogCommand } from './commands/blog'
import { skillsCommand } from './commands/skills'
import { deployCommand } from './commands/deploy'

const program = new Command()

program
  .name('portfolio-cli')
  .description('CLI tool for managing your portfolio website')
  .version('1.0.0')

// Register commands
program.addCommand(aboutCommand)
program.addCommand(projectsCommand)
program.addCommand(blogCommand)
program.addCommand(skillsCommand)
program.addCommand(deployCommand)

// Add contact command inline (simpler)
const contactCommand = new Command('contact')
  .description('Manage contact info')

import { supabase } from './lib/supabase'
import { revalidatePath } from './lib/revalidate'
import chalk from 'chalk'

contactCommand
  .command('show')
  .description('Show contact info')
  .action(async () => {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.log(chalk.yellow('No contact info found.'))
      return
    }

    console.log(chalk.bold('\nContact Info:'))
    console.log(chalk.cyan('Email:'), data.email)
    console.log(chalk.cyan('GitHub:'), data.github_url || 'Not set')
    console.log(chalk.cyan('LinkedIn:'), data.linkedin_url || 'Not set')
    console.log(chalk.cyan('Twitter:'), data.twitter_url || 'Not set')
  })

contactCommand
  .command('update')
  .description('Update contact info')
  .option('-e, --email <email>', 'Email address')
  .option('--github <url>', 'GitHub URL')
  .option('--linkedin <url>', 'LinkedIn URL')
  .option('--twitter <url>', 'Twitter URL')
  .action(async (options) => {
    const updates: Record<string, string> = {}

    if (options.email) updates.email = options.email
    if (options.github) updates.github_url = options.github
    if (options.linkedin) updates.linkedin_url = options.linkedin
    if (options.twitter) updates.twitter_url = options.twitter

    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('No updates provided.'))
      return
    }

    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .eq('is_active', true)
      .single()

    let result

    if (existing) {
      result = await supabase.from('contact_info').update(updates).eq('id', existing.id)
    } else {
      if (!updates.email) {
        console.error(chalk.red('Email is required when creating contact info.'))
        return
      }
      result = await supabase.from('contact_info').insert({ ...updates, is_active: true })
    }

    if (result.error) {
      console.error(chalk.red('Error updating contact info:'), result.error.message)
      return
    }

    console.log(chalk.green('Contact info updated!'))
    await revalidatePath('/contact')
  })

program.addCommand(contactCommand)

program.parse()
