import { clsx } from 'clsx';
import { getStatusColor } from '../../utils/formatters';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'status';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  status: '',
};

export function Badge({ children, variant = 'default', status, className, dot = false }: BadgeProps) {
  const colorClass = variant === 'status' && status ? getStatusColor(status) : variantMap[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
