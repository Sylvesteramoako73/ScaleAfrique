'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { BlockRenderer } from '@/views/FunnelBuilder';
import type { Funnel, Block } from '@/services/funnel.service';

export default function PublicFunnelPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/public/funnels/${slug}`)
      .then(r => setFunnel(r.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (pageId: string, data: Record<string, string>) => {
    try {
      await api.post(`/public/funnels/${slug}/submit`, { pageId, data });
    } catch {
      // submission errors are silent; success state shown by BlockRenderer
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound || !funnel) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500">This funnel may have been unpublished or doesn't exist.</p>
    </div>
  );

  const page = funnel.pages?.[0];

  return (
    <div className="min-h-screen bg-white">
      {(funnel.pages ?? []).map(p => (
        <div key={p.id}>
          {p.blocks.map((block: Block) => (
            <BlockRenderer key={block.id} block={block} onSubmit={data => handleSubmit(p.id, data)} />
          ))}
        </div>
      ))}
      <div className="py-6 text-center text-xs text-gray-300">
        Powered by ScaleAfrique
      </div>
    </div>
  );
}
