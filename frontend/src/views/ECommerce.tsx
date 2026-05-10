'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, ShoppingBag, Package, DollarSign, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { ecommerceService, Product, Order, EcomStats } from '../services/ecommerce.service';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const CURRENCIES = ['USD', 'NGN', 'KES', 'GHS', 'ZAR'];
const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

export function ECommerce() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'Products' | 'Orders'>('Products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', currency: 'USD', inventory: '', category: '', description: '' });

  const { data: stats } = useQuery<EcomStats>({ queryKey: ['ecom-stats'], queryFn: ecommerceService.getStats });
  const { data: products = [], isLoading: pLoading } = useQuery<Product[]>({ queryKey: ['products'], queryFn: ecommerceService.listProducts });
  const { data: orders = [], isLoading: oLoading } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: ecommerceService.listOrders });

  const createProduct = useMutation({
    mutationFn: () => ecommerceService.createProduct({
      name: productForm.name,
      price: parseFloat(productForm.price),
      currency: productForm.currency,
      inventory: parseInt(productForm.inventory) || 0,
      category: productForm.category,
      description: productForm.description,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['ecom-stats'] });
      setShowAddProduct(false);
      setProductForm({ name: '', price: '', currency: 'USD', inventory: '', category: '', description: '' });
      toast.success('Product created');
    },
    onError: () => toast.error('Failed to create product'),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => ecommerceService.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['ecom-stats'] });
      toast.success('Product deleted');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ecommerceService.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status updated');
    },
  });

  const pf = (k: string, v: string) => setProductForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-Commerce</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your products and orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Products', value: stats?.products ?? 0, icon: <Package size={18} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Orders', value: stats?.orders ?? 0, icon: <ShoppingBag size={18} />, color: 'text-green-600 bg-green-50' },
          { label: 'Revenue', value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: <DollarSign size={18} />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pending', value: stats?.pending ?? 0, icon: <Clock size={18} />, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={clsx('p-2 rounded-lg', color)}>{icon}</div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {(['Products', 'Orders'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx('px-5 py-2.5 text-sm font-medium border-b-2 transition-colors', tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === 'Products' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button icon={<Plus size={15} />} onClick={() => setShowAddProduct(true)}>Add Product</Button>
          </div>
          {pLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <Card key={p.id} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{formatCurrency(p.price, p.currency)}</p>
                      <p className="text-xs text-gray-400 mt-1">Stock: {p.inventory}</p>
                    </div>
                    <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id); }} className="text-gray-300 hover:text-red-500 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Card>
              ))}
              {products.length === 0 && <p className="col-span-3 text-center text-gray-400 py-12">No products yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'Orders' && (
        <Card padding={false}>
          {oLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{o.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{o.items.length}</td>
                      <td className="px-4 py-3 text-gray-700">{formatCurrency(o.total, o.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600')}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="rounded border border-gray-200 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          value={o.status}
                          onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                        >
                          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-12">No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add Product Modal */}
      <Modal open={showAddProduct} onClose={() => setShowAddProduct(false)} title="Add Product" footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowAddProduct(false)}>Cancel</Button>
          <Button loading={createProduct.isPending} disabled={!productForm.name || !productForm.price} onClick={() => createProduct.mutate()}>Create Product</Button>
        </div>
      }>
        <div className="space-y-3">
          <Input label="Name" value={productForm.name} onChange={(e) => pf('name', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price" type="number" value={productForm.price} onChange={(e) => pf('price', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={productForm.currency} onChange={(e) => pf('currency', e.target.value)}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Input label="Inventory" type="number" value={productForm.inventory} onChange={(e) => pf('inventory', e.target.value)} />
          <Input label="Category" value={productForm.category} onChange={(e) => pf('category', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" rows={3} value={productForm.description} onChange={(e) => pf('description', e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" size="lg" footer={
        <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
      }>
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">Customer: </span><span className="font-medium">{selectedOrder.customerName}</span></div>
              <div><span className="text-gray-500">Email: </span><span>{selectedOrder.customerEmail}</span></div>
              <div><span className="text-gray-500">Total: </span><span className="font-medium">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span></div>
              <div><span className="text-gray-500">Status: </span>
                <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', STATUS_COLORS[selectedOrder.status])}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity, selectedOrder.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
