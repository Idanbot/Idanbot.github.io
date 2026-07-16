import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { socialActions } from '@/data/siteActions';

export function SocialDock() {
  return (
    <div className="liquid-glass flex items-center gap-1.5 rounded-full p-1.5">
      {socialActions.map((social) => (
        <SocialLink
          key={social.kind}
          href={social.href}
          icon={<SocialIcon kind={social.kind} className="size-5" />}
          label={social.label}
        />
      ))}
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const isMail = href.startsWith('mailto:');
  const reducedMotion = usePrefersReducedMotion();
  return (
    <a
      href={href}
      {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      className={`icon-link group relative z-[1] inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-white/[0.035] p-2.5 text-white/58 shadow-sm outline-none transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/16 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_14px_44px_-26px_rgba(255,255,255,0.72)] focus-visible:ring-2 focus-visible:ring-cloud/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-12 sm:w-12 sm:p-3 ${
        reducedMotion ? '' : 'hover:-translate-y-[0.025rem] active:scale-[0.97]'
      }`}
      aria-label={label}
    >
      <span className="pointer-events-none absolute bottom-[calc(100%+0.65rem)] left-1/2 -translate-x-1/2 translate-y-1 rounded-full border border-white/10 bg-black/90 px-2.5 py-1 text-xs font-medium text-white/78 opacity-0 shadow-[0_12px_36px_-24px_rgba(255,255,255,0.8)] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {label}
      </span>
      <span className="flex shrink-0 items-center justify-center transition-colors duration-100 group-hover:text-white group-focus-visible:text-white">
        {icon}
      </span>
    </a>
  );
}

function SocialIcon({ kind, ...props }: React.SVGProps<SVGSVGElement> & { kind: string }) {
  if (kind === 'linkedin') return <LinkedinIcon {...props} />;
  if (kind === 'email') return <MailIcon {...props} />;
  return <GithubIcon {...props} />;
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 0C5.37 0 0 5.5 0 12.29c0 5.43 3.44 10.03 8.2 11.65.6.11.82-.27.82-.59 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.65-4.04-1.65-.55-1.42-1.33-1.8-1.33-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.81 1.33 3.5 1.02.11-.79.42-1.33.76-1.64-2.66-.31-5.46-1.36-5.46-6.07 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26A11.21 11.21 0 0 1 12 5.97c1.02.01 2.04.14 3 .41 2.29-1.59 3.3-1.26 3.3-1.26.66 1.69.24 2.94.12 3.25.77.86 1.24 1.96 1.24 3.3 0 4.72-2.8 5.75-5.47 6.06.43.38.81 1.13.81 2.28 0 1.65-.02 2.97-.02 3.37 0 .33.22.71.83.59A12.29 12.29 0 0 0 24 12.29C24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.32 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M1.5 4.5A2.5 2.5 0 0 1 4 2h16a2.5 2.5 0 0 1 2.5 2.5v15A2.5 2.5 0 0 1 20 22H4a2.5 2.5 0 0 1-2.5-2.5v-15Zm2.3-.1a.75.75 0 0 0-.8.75v.36l9 6.1 9-6.1v-.36a.75.75 0 0 0-.8-.75H3.8Zm17.2 3.3-8.58 5.82a.75.75 0 0 1-.84 0L3 7.7v11.05c0 .41.34.75.75.75h16.5c.41 0 .75-.34.75-.75V7.7Z" />
    </svg>
  );
}
