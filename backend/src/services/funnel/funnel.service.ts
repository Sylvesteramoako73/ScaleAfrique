import { prisma } from '../../config/database';

function makeSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

export const funnelService = {
  async list(workspaceId: string) {
    return prisma.funnel.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { pages: true, submissions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async get(id: string, workspaceId: string) {
    return prisma.funnel.findFirst({
      where: { id, workspaceId },
      include: {
        pages: { orderBy: { order: 'asc' } },
        _count: { select: { submissions: true } },
      },
    });
  },

  async getBySlug(slug: string) {
    return prisma.funnel.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { pages: { orderBy: { order: 'asc' } } },
    });
  },

  async create(workspaceId: string, name: string, description?: string) {
    const slug = makeSlug(name);
    const funnel = await prisma.funnel.create({
      data: { workspaceId, name, slug, description },
    });
    // create a default first page
    await prisma.funnelPage.create({
      data: {
        funnelId: funnel.id,
        name: 'Page 1',
        order: 0,
        blocks: [
          { id: 'b1', type: 'hero', title: name, subtitle: 'Welcome! We\'re glad you\'re here.', bgColor: '#1a1a2e', textColor: '#ffffff' },
          { id: 'b2', type: 'form', fields: [{ name: 'name', label: 'Full Name', type: 'text', required: true }, { name: 'email', label: 'Email Address', type: 'email', required: true }], submitLabel: 'Get Started', successMessage: 'Thanks! We\'ll be in touch.' },
        ],
      },
    });
    return prisma.funnel.findUnique({
      where: { id: funnel.id },
      include: { pages: { orderBy: { order: 'asc' } } },
    });
  },

  async update(id: string, workspaceId: string, data: { name?: string; description?: string; status?: string }) {
    return prisma.funnel.update({ where: { id, workspaceId }, data });
  },

  async delete(id: string, workspaceId: string) {
    return prisma.funnel.delete({ where: { id, workspaceId } });
  },

  async upsertPage(funnelId: string, workspaceId: string, pageId: string | null, data: { name?: string; order?: number; blocks?: unknown[] }) {
    // verify ownership
    const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, workspaceId } });
    if (!funnel) throw new Error('Not found');

    if (pageId) {
      return prisma.funnelPage.update({
        where: { id: pageId },
        data: { ...data, blocks: data.blocks as never },
      });
    }

    const count = await prisma.funnelPage.count({ where: { funnelId } });
    return prisma.funnelPage.create({
      data: {
        funnelId,
        name: data.name ?? `Page ${count + 1}`,
        order: data.order ?? count,
        blocks: (data.blocks ?? []) as never,
      },
    });
  },

  async deletePage(funnelId: string, workspaceId: string, pageId: string) {
    const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, workspaceId } });
    if (!funnel) throw new Error('Not found');
    return prisma.funnelPage.delete({ where: { id: pageId } });
  },

  async publish(id: string, workspaceId: string) {
    return prisma.funnel.update({ where: { id, workspaceId }, data: { status: 'PUBLISHED' } });
  },

  async unpublish(id: string, workspaceId: string) {
    return prisma.funnel.update({ where: { id, workspaceId }, data: { status: 'DRAFT' } });
  },

  async submit(slug: string, pageId: string | undefined, formData: Record<string, string>, ipAddress?: string) {
    const funnel = await prisma.funnel.findUnique({ where: { slug } });
    if (!funnel) throw new Error('Funnel not found');

    // create CRM contact from email/name if present
    let contactId: string | undefined;
    if (formData.email) {
      const existing = await prisma.contact.findFirst({
        where: { workspaceId: funnel.workspaceId, email: formData.email },
      });
      if (existing) {
        contactId = existing.id;
      } else {
        const fullName = (formData.name ?? formData.email ?? '').trim();
        const [firstName, ...rest] = fullName.split(' ');
        const contact = await prisma.contact.create({
          data: {
            workspaceId: funnel.workspaceId,
            userId: funnel.workspaceId,
            firstName: firstName || formData.email!,
            lastName: rest.join(' ') || undefined,
            email: formData.email,
            phone: formData.phone,
            source: 'FUNNEL',
            tags: [funnel.name],
          },
        });
        contactId = contact.id;
      }
    }

    return prisma.funnelSubmission.create({
      data: {
        funnelId: funnel.id,
        pageId,
        data: formData as never,
        contactId,
        ipAddress,
      },
    });
  },

  async getSubmissions(funnelId: string, workspaceId: string) {
    const funnel = await prisma.funnel.findFirst({ where: { id: funnelId, workspaceId } });
    if (!funnel) throw new Error('Not found');
    return prisma.funnelSubmission.findMany({
      where: { funnelId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
