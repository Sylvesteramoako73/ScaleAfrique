import { clsx } from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export function Spinner({ size = 'md', className }: { size?: SpinnerSize; className?: string }) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-current border-t-transparent',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
