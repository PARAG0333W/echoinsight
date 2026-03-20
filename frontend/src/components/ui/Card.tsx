import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => (
  <div
    className={[
      'card',
      'p-4 md:p-5',
      'transition-shadow',
      'hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]',
      className,
    ].join(' ')}
    {...props}
  />
);