import { Command } from 'commander'
import chalk from 'chalk'
import { supabase } from '../lib/supabase'
import { revalidatePath } from '../lib/revalidate'

export const skillsCommand = new Command('skills')
  .description('Manage skills')

skillsCommand
  .command('list')
  .description('List all skills')
  .option('--category <category>', 'Filter by category')
  .action(async (options) => {
    let query = supabase.from('skills').select('*').eq('is_active', true).order('display_order')

    if (options.category) {
      query = query.eq('category', options.category)
    }

    const { data, error } = await query

    if (error) {
      console.error(chalk.red('Error fetching skills:'), error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log(chalk.yellow('No skills found.'))
      return
    }

    // Group by category
    const grouped = data.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, typeof data>)

    console.log(chalk.bold('\nSkills:\n'))

    Object.entries(grouped).forEach(([category, skills]) => {
      console.log(chalk.cyan.bold(`${category}:`))
      skills.forEach((skill) => {
        const dots = '●'.repeat(skill.proficiency) + '○'.repeat(5 - skill.proficiency)
        console.log(`  ${skill.icon || '•'} ${skill.name} ${chalk.gray(dots)}`)
      })
      console.log()
    })
  })

skillsCommand
  .command('add')
  .description('Add a new skill')
  .requiredOption('-n, --name <name>', 'Skill name')
  .requiredOption('-c, --category <category>', 'Category (e.g., "Languages", "Frameworks")')
  .option('-p, --proficiency <level>', 'Proficiency level 1-5', '3')
  .option('-i, --icon <icon>', 'Emoji or icon')
  .option('-o, --order <number>', 'Display order', '0')
  .action(async (options) => {
    const proficiency = parseInt(options.proficiency, 10)

    if (proficiency < 1 || proficiency > 5) {
      console.error(chalk.red('Proficiency must be between 1 and 5'))
      return
    }

    const skill = {
      name: options.name,
      category: options.category,
      proficiency,
      icon: options.icon || null,
      display_order: parseInt(options.order, 10),
      is_active: true,
    }

    const { data, error } = await supabase.from('skills').insert(skill).select().single()

    if (error) {
      console.error(chalk.red('Error adding skill:'), error.message)
      return
    }

    console.log(chalk.green(`Skill "${data.name}" added to ${data.category}!`))

    await revalidatePath('/')
    await revalidatePath('/about')
  })

skillsCommand
  .command('update <name>')
  .description('Update a skill')
  .option('-c, --category <category>', 'Category')
  .option('-p, --proficiency <level>', 'Proficiency level 1-5')
  .option('-i, --icon <icon>', 'Emoji or icon')
  .option('-o, --order <number>', 'Display order')
  .action(async (name, options) => {
    const updates: Record<string, unknown> = {}

    if (options.category) updates.category = options.category
    if (options.icon) updates.icon = options.icon
    if (options.order) updates.display_order = parseInt(options.order, 10)

    if (options.proficiency) {
      const proficiency = parseInt(options.proficiency, 10)
      if (proficiency < 1 || proficiency > 5) {
        console.error(chalk.red('Proficiency must be between 1 and 5'))
        return
      }
      updates.proficiency = proficiency
    }

    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('No updates provided.'))
      return
    }

    const { error } = await supabase.from('skills').update(updates).eq('name', name)

    if (error) {
      console.error(chalk.red('Error updating skill:'), error.message)
      return
    }

    console.log(chalk.green(`Skill "${name}" updated!`))

    await revalidatePath('/')
    await revalidatePath('/about')
  })

skillsCommand
  .command('remove <name>')
  .description('Remove a skill')
  .action(async (name) => {
    const { error } = await supabase.from('skills').update({ is_active: false }).eq('name', name)

    if (error) {
      console.error(chalk.red('Error removing skill:'), error.message)
      return
    }

    console.log(chalk.green(`Skill "${name}" removed!`))

    await revalidatePath('/')
    await revalidatePath('/about')
  })

skillsCommand
  .command('categories')
  .description('List all skill categories')
  .action(async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error(chalk.red('Error fetching categories:'), error.message)
      return
    }

    const categories = [...new Set(data?.map((s) => s.category) || [])]

    if (categories.length === 0) {
      console.log(chalk.yellow('No categories found.'))
      return
    }

    console.log(chalk.bold('\nSkill Categories:\n'))
    categories.forEach((cat) => console.log(`  • ${cat}`))
  })
