import { cn } from '@/lib/utils';

export default function Badge({
  label,
  tone = 'accent'
}: {
  label: string;
  tone?: 'accent' | 'dark';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-sharp px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        tone === 'accent' ? 'bg-accent text-black' : 'bg-grey-dark text-white'
      )}
    >
      {label}
    </span>
  );
}
