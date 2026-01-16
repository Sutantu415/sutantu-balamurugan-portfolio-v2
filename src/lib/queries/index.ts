import { createServerClient } from '@/lib/supabase/server'
import type { About, Project, BlogPost, Skill, ContactInfo } from '@/types/database'

export async function getAbout(): Promise<About | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('about')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching about:', error)
    return null
  }
  return data
}

export async function getProjects(featured?: boolean): Promise<Project[]> {
  const supabase = createServerClient()
  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  return data || []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }
  return data
}

export async function getBlogPosts(featured?: boolean): Promise<BlogPost[]> {
  const supabase = createServerClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
  return data || []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
  return data
}

export async function getSkills(): Promise<Skill[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching skills:', error)
    return []
  }
  return data || []
}

export async function getSkillsByCategory(): Promise<Record<string, Skill[]>> {
  const skills = await getSkills()
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)
}

export async function getContactInfo(): Promise<ContactInfo | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching contact info:', error)
    return null
  }
  return data
}
