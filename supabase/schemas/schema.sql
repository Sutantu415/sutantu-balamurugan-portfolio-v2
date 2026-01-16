-- Portfolio Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- About table
CREATE TABLE IF NOT EXISTS public.about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  short_bio TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  featured_image TEXT,
  live_url TEXT,
  github_url TEXT,
  tech_stack TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  reading_time INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Contact info table
CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  other_links JSONB,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
-- Drop existing policies if they exist (to make script re-runnable)
DROP POLICY IF EXISTS "Public read" ON public.about;
DROP POLICY IF EXISTS "Public read" ON public.projects;
DROP POLICY IF EXISTS "Public read" ON public.blog_posts;
DROP POLICY IF EXISTS "Public read" ON public.skills;
DROP POLICY IF EXISTS "Public read" ON public.contact_info;

CREATE POLICY "Public read" ON public.about FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public read" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read" ON public.skills FOR SELECT USING (is_active = true);
CREATE POLICY "Public read" ON public.contact_info FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category) WHERE is_active = true;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for about table
DROP TRIGGER IF EXISTS update_about_updated_at ON public.about;
CREATE TRIGGER update_about_updated_at
  BEFORE UPDATE ON public.about
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
