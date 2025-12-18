'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = "Loading...", size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'p-8 max-w-sm',
    md: 'p-12 max-w-md', 
    lg: 'p-16 max-w-lg'
  };

  return (
    <div className="text-center py-16">
      <div className={`card-aurora ${sizeClasses[size]} mx-auto`}>
        <div className="loading-aurora mx-auto mb-4"></div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}