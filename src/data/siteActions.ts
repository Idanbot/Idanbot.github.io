import { profile } from './profile';

export const SITE_SECTION_IDS = ['hero', 'skills', 'history', 'monitor'] as const;

export type SiteSectionId = (typeof SITE_SECTION_IDS)[number];
export type SiteSectionIcon = 'home' | 'layers' | 'history' | 'activity';

export const siteSections = [
  { id: 'hero', label: 'Profile', commandLabel: 'Go to Profile', icon: 'home' },
  { id: 'skills', label: 'Stack', commandLabel: 'Go to Stack', icon: 'layers' },
  { id: 'history', label: 'Experience', commandLabel: 'Go to Experience', icon: 'history' },
  { id: 'monitor', label: 'Live', commandLabel: 'Go to Live status', icon: 'activity' },
] as const satisfies readonly {
  id: SiteSectionId;
  label: string;
  commandLabel: string;
  icon: SiteSectionIcon;
}[];

export const terminalShortcuts = [
  { command: 'neofetch', label: "Run 'neofetch'" },
  { command: 'joke', label: "Run 'joke'" },
  { command: 'skills', label: "Run 'skills'" },
] as const;

export const socialActions = profile.socials;

export const siteLinks = {
  repository: 'https://github.com/Idanbot/Idanbot.github.io',
  github: socialActions.find((social) => social.kind === 'github')?.href ?? 'https://github.com/Idanbot',
  linkedin:
    socialActions.find((social) => social.kind === 'linkedin')?.href ??
    'https://www.linkedin.com/in/idanbotbol/',
  email: socialActions.find((social) => social.kind === 'email')?.href ?? 'mailto:idan@idanbot.uk',
} as const;
