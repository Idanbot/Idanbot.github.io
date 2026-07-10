import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { OPEN_TERMINAL_EVENT } from '@/lib/site-events';
import {
  siteSections,
  socialActions,
  terminalShortcuts,
  type SiteSectionIcon,
} from '@/data/siteActions';
import {
  Search,
  Terminal,
  Github,
  Linkedin,
  Mail,
  FileText,
  Layers,
  Activity,
  Home,
} from 'lucide-react';

const sectionIcons = {
  home: Home,
  layers: Layers,
  history: FileText,
  activity: Activity,
} satisfies Record<SiteSectionIcon, typeof Home>;

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

export const CommandPalette = ({ startOpen = false }: { startOpen?: boolean }) => {
  const [open, setOpen] = useState(startOpen);
  const prefersReducedMotion = usePrefersReducedMotion();

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      contentClassName="liquid-glass fixed top-1/2 left-1/2 z-[999] w-[min(100vw-1.5rem,640px)] max-h-[min(85dvh,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      className="w-full"
      overlayClassName="fixed inset-0 z-[998] bg-black/80 backdrop-blur-sm"
    >
      <div className="flex items-center border-b border-white/10 px-3 pb-2 mb-2">
        <Search className="mr-2 h-5 w-5 shrink-0 text-gray-500" />
        <Command.Input
          className="h-10 w-full border-none bg-transparent text-base text-white outline-none placeholder:text-gray-500"
          placeholder="Jump to section or open link…"
        />
      </div>

      <Command.List className="max-h-[min(50vh,320px)] overflow-y-auto overscroll-contain p-1">
        <Command.Empty className="px-4 py-8 text-center text-sm leading-relaxed text-gray-400">
          <span className="font-medium text-gray-300">No matches.</span>
          <span className="mt-2 block text-xs text-gray-500">
            Try another query, pick a section from Navigation, or press Esc to close.
          </span>
        </Command.Empty>

        <Command.Group heading="Navigation" className="mb-2 px-2 text-xs font-medium text-gray-500">
          <Command.Item
            onSelect={() =>
              runCommand(() => {
                delete window.__pendingTerminalCommand;
                window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
              })
            }
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2.5 text-gray-300 transition-colors aria-selected:bg-white/10 aria-selected:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Terminal size={16} />
            <span>Open terminal</span>
            <kbd className="ml-auto rounded border border-white/15 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
              ~
            </kbd>
          </Command.Item>
          {siteSections.map((section) => {
            const Icon = sectionIcons[section.icon];
            return (
              <Command.Item
                key={section.id}
                onSelect={() => runCommand(() => scrollToId(section.id))}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2.5 text-gray-300 transition-colors aria-selected:bg-white/10 aria-selected:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Icon size={16} />
                <span>{section.commandLabel}</span>
              </Command.Item>
            );
          })}
        </Command.Group>

        <Command.Group heading="Terminal Shortcuts" className="mb-2 px-2 text-xs font-medium text-gray-500">
          {terminalShortcuts.map((shortcut) => (
            <Command.Item
              key={shortcut.command}
              onSelect={() =>
                runCommand(() => {
                  window.__pendingTerminalCommand = shortcut.command;
                  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
                })
              }
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2.5 text-gray-300 transition-colors aria-selected:bg-white/10 aria-selected:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Terminal size={16} />
              <span>{shortcut.label}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Socials" className="mt-2 px-2 text-xs font-medium text-gray-500">
          {socialActions.map((social) => {
            const Icon = socialIcons[social.kind];
            return (
              <Command.Item
                key={social.kind}
                onSelect={() =>
                  runCommand(() => {
                    if (social.href.startsWith('mailto:')) window.location.href = social.href;
                    else window.open(social.href, '_blank', 'noopener,noreferrer');
                  })
                }
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 py-2.5 text-gray-300 transition-colors aria-selected:bg-white/10 aria-selected:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Icon size={16} />
                <span>{social.label}</span>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
