import {
  LayoutGrid,
  FolderOpen,
  Sparkles,
  RotateCcw,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface Workspace {
  id: WorkspaceId;
  label: string;
  icon: LucideIcon;
  href: string;
  shortcut: string;
}

export type WorkspaceId =
  | 'home'
  | 'collections'
  | 'knowledge'
  | 'review'
  | 'insights'
  | 'settings';

export const WORKSPACES: Workspace[] = [
  { id: 'home', label: 'Home', icon: LayoutGrid, href: '/dashboard', shortcut: '1' },
  { id: 'collections', label: 'Collections', icon: FolderOpen, href: '/documents', shortcut: '2' },
  { id: 'knowledge', label: 'Knowledge', icon: Sparkles, href: '/knowledge', shortcut: '3' },
  { id: 'review', label: 'Review', icon: RotateCcw, href: '/decks', shortcut: '4' },
  { id: 'insights', label: 'Insights', icon: BarChart3, href: '/analytics', shortcut: '5' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', shortcut: '6' },
] as const;

export function getWorkspaceByHref(href: string): Workspace | undefined {
  return WORKSPACES.find((w) => href.startsWith(w.href));
}

export function getWorkspaceById(id: WorkspaceId): Workspace | undefined {
  return WORKSPACES.find((w) => w.id === id);
}
