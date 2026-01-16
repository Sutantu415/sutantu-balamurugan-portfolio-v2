import { Command } from 'commander'
import chalk from 'chalk'
import { revalidatePath, triggerNetlifyBuild } from '../lib/revalidate'

export const deployCommand = new Command('deploy')
  .description('Deployment and cache management')

deployCommand
  .command('revalidate')
  .description('Revalidate all pages (clear ISR cache)')
  .option('-p, --path <path>', 'Specific path to revalidate')
  .action(async (options) => {
    console.log(chalk.blue('Triggering revalidation...'))

    const success = await revalidatePath(options.path || undefined)

    if (success) {
      console.log(chalk.green('Cache cleared successfully!'))
    } else {
      console.log(chalk.yellow('Revalidation may have failed. Check your environment variables.'))
    }
  })

deployCommand
  .command('build')
  .description('Trigger a Netlify rebuild')
  .action(async () => {
    console.log(chalk.blue('Triggering Netlify build...'))

    const success = await triggerNetlifyBuild()

    if (success) {
      console.log(chalk.green('Build triggered! Check Netlify dashboard for progress.'))
    } else {
      console.log(chalk.yellow('Could not trigger build. Check NETLIFY_BUILD_HOOK_URL.'))
    }
  })

deployCommand
  .command('full')
  .description('Full deployment: revalidate cache + trigger rebuild')
  .action(async () => {
    console.log(chalk.blue('Starting full deployment...'))

    console.log('\n1. Revalidating cache...')
    await revalidatePath()

    console.log('\n2. Triggering Netlify build...')
    await triggerNetlifyBuild()

    console.log(chalk.green('\nFull deployment initiated!'))
  })
