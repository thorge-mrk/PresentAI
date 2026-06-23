'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ConfigurationInitializer({ children }: { children: React.ReactNode }) {
  const route = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (route === '/') {
      router.push('/dashboard');
    }
  }, [route, router]);

  return children;
}
