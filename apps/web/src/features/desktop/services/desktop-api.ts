/**
 * Typed bridge to the Tauri v2 Rust backend.
 *
 * Every function falls back gracefully if called outside Tauri.
 */
async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch {
    return null;
  }
}

export const desktopApi = {
  getAppInfo: () => invoke<{ name: string; version: string; platform: string }>('get_app_info'),

  openFileDialog: () => invoke<string | null>('open_file_dialog'),

  saveFileDialog: (defaultName: string) =>
    invoke<string | null>('save_file_dialog', { default_name: defaultName }),

  readTextFile: (path: string) => invoke<string>('read_text_file', { path }),

  writeTextFile: (path: string, content: string) =>
    invoke<void>('write_text_file', { path, content }),

  copyToClipboard: (text: string) => invoke<void>('copy_to_clipboard', { text }),

  pasteFromClipboard: () => invoke<string | null>('paste_from_clipboard'),

  sendNotification: (title: string, body: string) =>
    invoke<void>('send_notification', { title, body }),

  openInBrowser: (url: string) => invoke<void>('open_in_browser', { url }),
};
