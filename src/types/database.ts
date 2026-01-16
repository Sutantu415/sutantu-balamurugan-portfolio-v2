export interface About {
  id: string
  name: string
  title: string
  bio: string
  short_bio: string | null
  avatar_url: string | null
  resume_url: string | null
  location: string | null
  is_active: boolean
  updated_at: string
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  long_description: string | null
  featured_image: string | null
  live_url: string | null
  github_url: string | null
  tech_stack: string[]
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  featured_image: string | null
  tags: string[]
  is_published: boolean
  is_featured: boolean
  reading_time: number | null
  published_at: string | null
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
  icon: string | null
  display_order: number
  is_active: boolean
}

export interface ContactInfo {
  id: string
  email: string
  linkedin_url: string | null
  github_url: string | null
  twitter_url: string | null
  other_links: Record<string, string> | null
  is_active: boolean
}

export interface Database {
  public: {
    Tables: {
      about: {
        Row: About
        Insert: Omit<About, 'id' | 'updated_at'>
        Update: Partial<Omit<About, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'>
        Update: Partial<Omit<Project, 'id'>>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'created_at'>
        Update: Partial<Omit<BlogPost, 'id'>>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id'>
        Update: Partial<Omit<Skill, 'id'>>
      }
      contact_info: {
        Row: ContactInfo
        Insert: Omit<ContactInfo, 'id'>
        Update: Partial<Omit<ContactInfo, 'id'>>
      }
    }
  }
}
