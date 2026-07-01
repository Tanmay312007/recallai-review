'use client';

import { useEffect, useState } from 'react';

interface DesktopInfo {
  isDesktop: boolean;
  platform: string;
}

interface AppInfo {
  name: string;
  version: string;
  platform: string;
}

export function useDesktop(): DesktopInfo {
  const [info, setInfo] = useState<DesktopInfo>({
    isDesktop: false,
    platform: '',
  });

  useEffect(() => {
    async function check() {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const appInfo = await invoke<AppInfo>('get_app_info');
        setInfo({
          isDesktop: true,
          platform: appInfo.platform,
        });
      } catch {
        setInfo({
          isDesktop: false,
          platform: navigator.platform,
        });
      }
    }
    check();
  }, []);

  return info;
}
