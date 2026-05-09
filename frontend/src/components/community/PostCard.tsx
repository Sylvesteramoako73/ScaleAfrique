import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatRelativeDate, truncateText } from '../../utils/formatters';
import type { CommunityPost } from '../../types';

export function PostCard({ post }: { post: CommunityPost }) {
  return (
    <Card hover>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {post.user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{post.user?.name ?? 'Anonymous'}</span>
            {post.user?.startupProfile?.companyName && (
              <span className="text-xs text-gray-500">· {post.user.startupProfile.companyName}</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatRelativeDate(post.createdAt)}</span>
          </div>

          <h4 className="text-sm font-medium text-gray-900 mt-1">{post.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{truncateText(post.content, 160)}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {post.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="info" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <Heart size={14} /> {post.likes ?? 0}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors">
              <MessageCircle size={14} /> {post._count?.comments ?? 0}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors">
              <Share2 size={14} /> Share
            </button>
            <button className="ml-auto text-gray-400 hover:text-primary-600 transition-colors">
              <Bookmark size={14} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
