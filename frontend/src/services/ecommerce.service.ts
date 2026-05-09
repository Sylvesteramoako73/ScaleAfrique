import { api } from './api';
export interface Product { id: string; name: string; description?: string; price: number; currency: string; sku?: string; inventory: number; category?: string; isActive: boolean; createdAt: string; }
export interface Order { id: string; customerName: string; customerEmail: string; status: string; total: number; currency: string; items: { id: string; quantity: number; price: number; product: Product }[]; createdAt: string; }
export interface EcomStats { products: number; orders: number; revenue: number; pending: number; }
export const ecommerceService = {
  async getStats() { return (await api.get('/ecommerce/stats')).data.data as EcomStats; },
  async listProducts() { return (await api.get('/ecommerce/products')).data.data as Product[]; },
  async createProduct(data: Partial<Product> & { name: string; price: number }) { return (await api.post('/ecommerce/products', data)).data.data as Product; },
  async updateProduct(id: string, data: Partial<Product>) { return (await api.put(`/ecommerce/products/${id}`, data)).data.data as Product; },
  async deleteProduct(id: string) { await api.delete(`/ecommerce/products/${id}`); },
  async listOrders() { return (await api.get('/ecommerce/orders')).data.data as Order[]; },
  async createOrder(data: { customerName: string; customerEmail: string; items: { productId: string; quantity: number }[] }) { return (await api.post('/ecommerce/orders', data)).data.data as Order; },
  async updateOrderStatus(id: string, status: string) { return (await api.patch(`/ecommerce/orders/${id}/status`, { status })).data.data as Order; },
};
