import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/documents — list documents for a project
// POST /api/projects/[id]/documents — create a new document
// ---------------------------------------------------------------------------

const CreateSchema = z.object({
  title:    z.string().min(1).max(200).default('Untitled'),
  template: z.enum(['gdd', 'brand', 'content', 'spec', 'release']).nullable().optional(),
  content:  z.string().max(500000).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const docs = await prisma.document.findMany({
    where: { projectId: params.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, template: true, emoji: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ documents: docs });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title, template, content } = parsed.data;
  const starterContent = content ?? getTemplateContent(template ?? null);

  const doc = await prisma.document.create({
    data: {
      projectId: params.id,
      userId: session.user.id,
      title,
      template: template ?? null,
      content: starterContent,
      emoji: getTemplateEmoji(template ?? null),
    },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}

function getTemplateEmoji(template: string | null): string {
  const map: Record<string, string> = {
    gdd: '📋', brand: '🎨', content: '📅', spec: '⚙️', release: '🚀',
  };
  return map[template ?? ''] ?? '📄';
}

function getTemplateContent(template: string | null): string {
  const templates: Record<string, object> = {
    gdd: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Game Design Document' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Concept' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Describe the game concept here.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Core Mechanics' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'What does the player do? What makes it fun?' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Art Style' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Visual direction, references, color palette.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Roadmap' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Milestones, platforms, release date.' }] },
    ]},
    brand: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Brand Book' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Brand Identity' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Mission, vision, and core values.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Visual Identity' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Logo usage, colors, typography.' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Voice & Tone' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'How we communicate, what we avoid.' }] },
    ]},
    content: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Content Calendar' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'What do we want to achieve with content?' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Planned Content' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'List topics, formats, and target dates.' }] },
    ]},
    spec: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Technical Specification' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'What is this system? What problem does it solve?' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Architecture' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Components, data flow, dependencies.' }] },
    ]},
    release: { type: 'doc', content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Release Notes' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'v1.0.0' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Initial release.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Added' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'New features.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Fixed' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Bug fixes.' }] },
    ]},
  };
  return JSON.stringify(templates[template ?? ''] ?? { type: 'doc', content: [] });
}
