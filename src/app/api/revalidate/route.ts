import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidation-secret')

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { path, tag, type = 'page' } = body

    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        tag,
        timestamp: Date.now(),
      })
    }

    if (path) {
      revalidatePath(path, type === 'layout' ? 'layout' : 'page')
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path,
        timestamp: Date.now(),
      })
    }

    // Revalidate all main pages if no specific path/tag
    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/projects')
    revalidatePath('/blog')
    revalidatePath('/contact')

    return NextResponse.json({
      revalidated: true,
      type: 'all',
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Invalid revalidation secret' },
      { status: 401 }
    )
  }

  // Revalidate all pages
  revalidatePath('/', 'layout')

  return NextResponse.json({
    revalidated: true,
    timestamp: Date.now(),
  })
}
