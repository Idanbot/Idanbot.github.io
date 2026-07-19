import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  SiAmazonwebservices,
  SiApachecassandra,
  SiApachekafka,
  SiArgo,
  SiDatadog,
  SiDocker,
  SiElasticsearch,
  SiGo,
  SiGooglecloud,
  SiGrafana,
  SiGnubash,
  SiHelm,
  SiKubernetes,
  SiLinux,
  SiNginx,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPrometheus,
  SiPython,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiSpringboot,
  SiTerraform,
  SiTypescript,
} from 'react-icons/si';
import { Award, ExternalLink, Layers, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { profile } from '@/data/profile';

const stacks: { name: string; category: string; Icon: IconType }[] = [
  { name: 'Kubernetes', category: 'Platform', Icon: SiKubernetes },
  { name: 'Helm', category: 'Delivery', Icon: SiHelm },
  { name: 'AWS', category: 'Cloud', Icon: SiAmazonwebservices },
  { name: 'GCP', category: 'Cloud', Icon: SiGooglecloud },
  { name: 'Terraform', category: 'IaC', Icon: SiTerraform },
  { name: 'Docker', category: 'Runtime', Icon: SiDocker },
  { name: 'Nginx', category: 'Edge', Icon: SiNginx },
  { name: 'Argo CD', category: 'GitOps', Icon: SiArgo },
  { name: 'Linux', category: 'Systems', Icon: SiLinux },
  { name: 'Bash', category: 'Scripting', Icon: SiGnubash },
  { name: 'Spring Boot', category: 'Backend', Icon: SiSpringboot },
  { name: 'Go', category: 'Backend', Icon: SiGo },
  { name: 'Python', category: 'Backend', Icon: SiPython },
  { name: 'Java', category: 'Backend', Icon: SiOpenjdk },
  { name: 'Node.js', category: 'Backend', Icon: SiNodedotjs },
  { name: 'React', category: 'Frontend', Icon: SiReact },
  { name: 'TypeScript', category: 'Frontend', Icon: SiTypescript },
  { name: 'PostgreSQL', category: 'Data', Icon: SiPostgresql },
  { name: 'Redis', category: 'Data', Icon: SiRedis },
  { name: 'Cassandra', category: 'Data', Icon: SiApachecassandra },
  { name: 'RabbitMQ', category: 'Messaging', Icon: SiRabbitmq },
  { name: 'Kafka', category: 'Messaging', Icon: SiApachekafka },
  { name: 'Prometheus', category: 'Observability', Icon: SiPrometheus },
  { name: 'Grafana', category: 'Observability', Icon: SiGrafana },
  { name: 'Elasticsearch', category: 'Observability', Icon: SiElasticsearch },
  { name: 'Datadog', category: 'Observability', Icon: SiDatadog },
];

const categorySummary = ['Cloud', 'Platform', 'Delivery', 'Backend', 'Data', 'Observability'];

const categoryAccent = (category: string) => {
  const accents: Record<string, string> = {
    Cloud: 'stack-accent-cloud',
    Platform: 'stack-accent-cloud',
    Delivery: 'stack-accent-cloud',
    GitOps: 'stack-accent-cloud',
    Runtime: 'stack-accent-cloud',
    Edge: 'stack-accent-cloud',
    Systems: 'stack-accent-platform',
    Scripting: 'stack-accent-platform',
    IaC: 'stack-accent-platform',
    Backend: 'stack-accent-platform',
    Frontend: 'stack-accent-platform',
    Data: 'stack-accent-platform',
    Messaging: 'stack-accent-platform',
    Observability: 'stack-accent-platform',
  };
  return accents[category] ?? 'stack-accent-primary';
};

type StackSectionProps = { className?: string };

export const StackSection = ({ className }: StackSectionProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Marquee loop clones render only when idle after hydration: keeps the
  // prerendered DOM small and the clone re-render out of the critical window.
  const [marqueeReady, setMarqueeReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setMarqueeReady(true));
      return () => window.cancelIdleCallback(handle);
    }
    const timeout = window.setTimeout(() => setMarqueeReady(true), 200);
    return () => window.clearTimeout(timeout);
  }, []);
  const marqueeStacks = prefersReducedMotion || !marqueeReady ? stacks : [...stacks, ...stacks];

  return (
    <section
      id="skills"
      className={`site-content-width mx-auto border-t border-white/5 px-4 py-14 sm:px-6 md:py-20 snap-start ${className ?? ''}`}
      aria-labelledby="skills-heading"
    >
      <div className="mb-8 text-center md:mb-10">
        <div className="mb-3 inline-flex items-center justify-center gap-2 text-cloud/90">
          <Layers
            className="size-7 motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
        </div>
        <h2 id="skills-heading" className="mb-3 text-3xl font-bold md:text-4xl">
          Core <span className="text-gradient">Stack</span>
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Tools and platforms I use to ship reliable systems, from clusters to observability.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {categorySummary.map((category) => (
            <span
              key={category}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${categoryAccent(category)}`}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div
        className={
          prefersReducedMotion
            ? "relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "stack-marquee-shell liquid-glass relative overflow-hidden rounded-2xl p-2 focus-within:overflow-x-auto focus-within:[scrollbar-width:none] focus-within:[&::-webkit-scrollbar]:hidden"
        }
        aria-label="Core stack carousel"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-[var(--background)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-[var(--background)] to-transparent"
          aria-hidden
        />
        <ul
          className={`m-0 flex h-[122px] list-none flex-nowrap items-stretch gap-3 px-1 py-2 md:h-[132px] md:gap-4 ${prefersReducedMotion ? '' : 'stack-marquee'}`}
          aria-describedby={!prefersReducedMotion ? 'stack-inspect-hint' : undefined}
        >
        {marqueeStacks.map((item, index) => {
          const Icon = item.Icon;
          return (
            <li
              key={`${item.name}-${index}`}
              aria-hidden={!prefersReducedMotion && index >= stacks.length}
              tabIndex={!prefersReducedMotion && index < stacks.length ? 0 : -1}
              aria-label={`${item.name}, ${item.category}`}
              className="list-none shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--stack-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className={`premium-card stack-card-lid group h-full w-[128px] border border-white/10 bg-card/55 backdrop-blur-sm transition-[border-color,box-shadow,background-color,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[color:var(--stack-accent)] hover:bg-white/[0.055] hover:shadow-[0_18px_58px_-32px_var(--stack-accent)] focus-within:border-[color:var(--stack-accent)] max-sm:hover:translate-y-0 max-sm:hover:shadow-none max-sm:hover:brightness-[1.04] motion-reduce:transition-none md:w-[148px] ${categoryAccent(item.category)}`}>
                <CardContent className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center md:gap-2">
                  <span className="flex size-10 origin-center items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition-[background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:bg-[color:var(--stack-accent-soft)] group-hover:shadow-[0_0_26px_-12px_var(--stack-accent)] group-hover:ring-[color:var(--stack-accent-border)] motion-reduce:group-hover:scale-100">
                    <Icon
                      className="size-5 text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[color:var(--stack-accent)] group-hover:drop-shadow-[0_0_10px_var(--stack-accent)]"
                      aria-hidden
                    />
                  </span>
                  <Badge
                    variant="muted"
                    className="font-mono text-[9px] uppercase tracking-wider transition-colors duration-150 ease-out group-hover:border-[color:var(--stack-accent-border)] group-hover:text-[color:var(--stack-accent)] sm:text-[10px]"
                  >
                    {item.category}
                  </Badge>
                  <div className="text-xs font-semibold leading-snug text-card-foreground transition-colors duration-150 ease-out group-hover:text-foreground sm:text-sm">
                    {item.name}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
        </ul>
        {!prefersReducedMotion ? (
          <div
            id="stack-inspect-hint"
            className="stack-inspect-hint pointer-events-none absolute bottom-2 right-3 z-[2] hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/48 backdrop-blur-md transition-colors duration-200 md:inline-flex"
          >
            <PauseCircle className="size-3" aria-hidden />
            Hover to pause
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-6 max-w-2xl md:mt-8">
        <Card className="premium-card border-white/10 bg-card/50 text-left transition-colors hover:border-cloud/30 hover:bg-white/[0.045]">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
              <SiGooglecloud className="size-6 text-muted-foreground" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Award className="size-4 shrink-0 text-cloud" aria-hidden />
                <h3 className="text-sm font-semibold text-card-foreground sm:text-base">
                  {profile.certification.name}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Issued <time dateTime={profile.certification.issued}>{profile.certification.issuedLabel}</time>
                {' · '}
                Expires <time dateTime={profile.certification.expires}>{profile.certification.expiresLabel}</time>
              </p>
              <a
                href={profile.certification.credlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cloud"
              >
                Verify on Credly
                <ExternalLink className="size-3.5 shrink-0 opacity-80" aria-hidden />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
