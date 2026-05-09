import { prisma } from '../../config/database';

export const ecommerceService = {
  // Products
  async listProducts(workspaceId: string) {
    return prisma.product.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
  },
  async getProduct(id: string, workspaceId: string) {
    return prisma.product.findFirst({ where: { id, workspaceId } });
  },
  async createProduct(workspaceId: string, data: { name: string; description?: string; price: number; currency?: string; sku?: string; inventory?: number; category?: string; images?: string[] }) {
    return prisma.product.create({ data: { workspaceId, ...data } });
  },
  async updateProduct(id: string, workspaceId: string, data: Partial<{ name: string; description: string; price: number; inventory: number; isActive: boolean; category: string }>) {
    return prisma.product.update({ where: { id, workspaceId }, data });
  },
  async deleteProduct(id: string, workspaceId: string) {
    return prisma.product.delete({ where: { id, workspaceId } });
  },

  // Orders
  async listOrders(workspaceId: string) {
    return prisma.order.findMany({
      where: { workspaceId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },
  async createOrder(workspaceId: string, data: {
    customerName: string;
    customerEmail: string;
    currency?: string;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }) {
    const products = await prisma.product.findMany({ where: { id: { in: data.items.map(i => i.productId) } } });
    const productMap = new Map(products.map(p => [p.id, p]));
    const total = data.items.reduce((sum, item) => sum + (productMap.get(item.productId)?.price ?? 0) * item.quantity, 0);

    return prisma.order.create({
      data: {
        workspaceId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        currency: data.currency ?? 'USD',
        notes: data.notes,
        total,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)?.price ?? 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  },
  async updateOrderStatus(id: string, workspaceId: string, status: string) {
    return prisma.order.update({ where: { id, workspaceId }, data: { status } });
  },

  async getDashboardStats(workspaceId: string) {
    const [products, orders, revenue] = await Promise.all([
      prisma.product.count({ where: { workspaceId, isActive: true } }),
      prisma.order.count({ where: { workspaceId } }),
      prisma.order.aggregate({ where: { workspaceId, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    ]);
    const pending = await prisma.order.count({ where: { workspaceId, status: 'PENDING' } });
    return { products, orders, revenue: revenue._sum.total ?? 0, pending };
  },
};
