import { m } from 'framer-motion';
import { Building2, CalendarDays, GitBranch, Inbox, Tag } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { profile } from '@/data/profile';

const commits = [...profile.experience];

export const GitHistory = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (commits.length === 0) {
    return (
      <div
        className="liquid-glass mx-auto max-w-4xl rounded-2xl p-10 text-center font-mono"
        role="status"
      >
        <Inbox className="mx-auto mb-4 size-10 text-muted-foreground" aria-hidden />
        <p className="text-base font-semibold text-card-foreground">No timeline entries yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When roles and milestones are loaded here, they will show up as a commit-style history.
        </p>
      </div>
    );
  }

  const nodeClass = (type: string) => {
    if (type === 'feat') {
      return 'border-2 border-primary/70 bg-primary shadow-[0_0_14px_-3px_color-mix(in_oklab,var(--primary),transparent)] ring-2 ring-background';
    }
    if (type === 'chore') {
      return 'border-2 border-border bg-muted ring-2 ring-background';
    }
    return 'border-2 border-primary/35 bg-secondary ring-2 ring-background';
  };

  const accentClass = (accent: string) => {
    const accents: Record<string, string> = {
      cloud: 'border-cloud/25 bg-cloud/8 text-cloud',
      platform: 'border-platform/25 bg-platform/8 text-platform',
      backend: 'border-backend/25 bg-backend/8 text-backend',
      delivery: 'border-cloud/25 bg-cloud/8 text-cloud',
      data: 'border-platform/25 bg-platform/8 text-platform',
    };
    return accents[accent] ?? 'border-primary/25 bg-primary/8 text-primary';
  };

  return (
    <div className="mx-auto max-w-4xl px-2 py-6 font-mono sm:px-6">
      <div className="mb-8 flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
        <GitBranch className="text-cloud/90" size={18} aria-hidden />
        <span className="text-foreground/90">professional trajectory</span>
      </div>

      <div className="relative ml-3 space-y-10 border-l-2 border-border sm:space-y-12">
        {commits.map((commit, index) => (
          <m.div
            key={commit.hash}
            initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08 }}
            className="relative pl-6 sm:pl-8"
          >
            <div
              className={`absolute -left-[9px] top-1 size-4 rounded-full ${nodeClass(commit.type)}`}
              aria-hidden
            />

            <article className="group rounded-2xl premium-card border border-white/10 bg-card/50 p-4 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-cloud/25 hover:bg-white/[0.045] sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded border border-white/10 bg-white/[0.045] px-2 py-0.5 text-xs text-white/60">
                  {commit.hash}
                </span>
                {commit.tag && (
                  <span className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-xs text-card-foreground">
                    <Tag size={10} aria-hidden /> {commit.tag}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-white sm:text-xl">
                {commit.msg}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${accentClass(commit.accent)}`}>
                  <Building2 size={12} aria-hidden />
                  {commit.company}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-muted-foreground">
                  <CalendarDays size={12} aria-hidden />
                  {commit.date}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-card-foreground/90">
                {commit.summary}
              </p>

              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {commit.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cloud/70" aria-hidden />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          </m.div>
        ))}

        <div className="relative pl-8 pt-4">
          <div
            className="absolute -left-[5px] top-0 size-2 rounded-full bg-muted-foreground/45 ring-2 ring-background"
            aria-hidden
          />
          <span className="text-sm text-muted-foreground">Initial commit</span>
        </div>
      </div>
    </div>
  );
};
