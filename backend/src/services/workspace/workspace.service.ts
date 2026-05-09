import { prisma } from '../../config/database';
import { AppError } from '../../api/middleware/errorHandler';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const workspaceService = {
  async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: { include: { _count: { select: { members: true } } } } },
      orderBy: { invitedAt: 'desc' },
    });
    return memberships.map(m => ({ ...m.workspace, role: m.role, memberCount: m.workspace._count.members }));
  },

  async createWorkspace(userId: string, name: string) {
    let slug = slugify(name);
    // Ensure unique slug
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: { create: { userId, role: 'OWNER', joinedAt: new Date() } },
      },
    });
    return workspace;
  },

  async getWorkspace(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
    if (!member) throw new AppError('Workspace not found or access denied', 404);
    return prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
    });
  },

  async inviteMember(workspaceId: string, inviterUserId: string, email: string, role: string = 'MEMBER') {
    // Check inviter has permission
    const inviter = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: inviterUserId, role: { in: ['OWNER', 'ADMIN'] } },
    });
    if (!inviter) throw new AppError('Insufficient permissions', 403);

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) throw new AppError('User not found. They must register first.', 404);

    const existing = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: invitedUser.id } });
    if (existing) throw new AppError('User is already a member', 409);

    return prisma.workspaceMember.create({
      data: { workspaceId, userId: invitedUser.id, role, joinedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async updateMemberRole(workspaceId: string, ownerId: string, memberId: string, role: string) {
    const owner = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: ownerId, role: 'OWNER' },
    });
    if (!owner) throw new AppError('Only workspace owner can change roles', 403);
    return prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });
  },

  async removeMember(workspaceId: string, removerId: string, memberUserId: string) {
    const remover = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: removerId, role: { in: ['OWNER', 'ADMIN'] } },
    });
    if (!remover) throw new AppError('Insufficient permissions', 403);
    await prisma.workspaceMember.deleteMany({ where: { workspaceId, userId: memberUserId } });
  },
};
