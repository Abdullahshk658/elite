export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-sharp bg-grey-light ${className}`} />;
}
