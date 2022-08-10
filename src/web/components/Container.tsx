import * as React from 'react';

export default function Container({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      style={{
        flexDirection: 'column',
        display: 'flex',
        height: '100vh',
      }}
    >
      {children}
    </div>
  );
}
