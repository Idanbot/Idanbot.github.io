import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Terminal, Github, Linkedin, Mail, FileText, Layers, Gamepad2 } from 'lucide-react';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl p-2 z-[999]"
      overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-sm z-[998]"
    >
      <div className="flex items-center border-b border-white/10 px-3 pb-2 mb-2">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <Command.Input 
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 h-10"
          placeholder="Type a command or search..."
        />
      </div>
      
      <Command.List className="max-h-[300px] overflow-y-auto p-1">
        <Command.Empty className="py-6 text-center text-gray-500 text-sm">No results found.</Command.Empty>

        <Command.Group heading="Navigation" className="text-gray-500 text-xs font-medium mb-2 px-2">
          <Command.Item onSelect={() => runCommand(() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Terminal size={16} />
            <span>Go to Hero</span>
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' }))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <FileText size={16} />
            <span>Go to History</span>
          </Command.Item>
           <Command.Item onSelect={() => runCommand(() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Layers size={16} />
            <span>Go to Stack</span>
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' }))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Gamepad2 size={16} />
            <span>Go to Deploy Game</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Socials" className="text-gray-500 text-xs font-medium mb-2 px-2 mt-2">
          <Command.Item onSelect={() => runCommand(() => window.open('https://github.com/Idanbot', '_blank'))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Github size={16} />
            <span>GitHub</span>
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => window.open('https://www.linkedin.com/in/idanbotbol/', '_blank'))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Linkedin size={16} />
            <span>LinkedIn</span>
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => window.open('mailto:idan@idanbot.uk', '_blank'))} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/10 text-gray-300 cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white">
            <Mail size={16} />
            <span>Email</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
