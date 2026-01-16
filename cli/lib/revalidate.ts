import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const revalidationSecret = process.env.REVALIDATION_SECRET

export async function revalidatePath(pathToRevalidate?: string): Promise<boolean> {
  if (!revalidationSecret) {
    console.warn('REVALIDATION_SECRET not set. Skipping revalidation.')
    return false
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidation-secret': revalidationSecret,
      },
      body: JSON.stringify({ path: pathToRevalidate }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Revalidation failed:', error)
      return false
    }

    const result = await response.json()
    console.log('Revalidation successful:', result)
    return true
  } catch (error) {
    console.error('Revalidation error:', error)
    return false
  }
}

export async function triggerNetlifyBuild(): Promise<boolean> {
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL

  if (!buildHookUrl) {
    console.warn('NETLIFY_BUILD_HOOK_URL not set. Skipping build trigger.')
    return false
  }

  try {
    const response = await fetch(buildHookUrl, {
      method: 'POST',
    })

    if (!response.ok) {
      console.error('Failed to trigger Netlify build')
      return false
    }

    console.log('Netlify build triggered successfully')
    return true
  } catch (error) {
    console.error('Error triggering Netlify build:', error)
    return false
  }
}
