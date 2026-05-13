interface SpinnerProps {
  size?: 'sm' | 'lg';
  center?: boolean;
}

export function Spinner({ size = 'sm', center = false }: SpinnerProps) {
  const spinner = <span className={`adm-spinner${size === 'lg' ? ' adm-spinner--lg' : ''}`} />;
  if (center) return <div className="adm-loading-center">{spinner}</div>;
  return spinner;
}
