import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-sharp border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-in-out disabled:opacity-40',
        variant === 'primary' && 'border-black bg-accent text-black hover:brightness-95',
        variant === 'secondary' && 'border-black bg-black text-white hover:bg-grey-dark',
        variant === 'ghost' && 'border-grey-light bg-transparent text-black hover:bg-grey-light',
        className
      )}
      {...props}
    />
  );
}
