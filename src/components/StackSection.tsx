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
import { Card, CardContent } from '@/components/ui/card';
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
  // Static prerendered content: the marquee clones ship in the HTML and
  // reduced-motion users get a scrollable static strip via CSS media query.
  const marqueeStacks = [...stacks, ...stacks];

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
        className="stack-marquee-shell liquid-glass relative overflow-hidden rounded-2xl p-2 focus-within:overflow-x-auto focus-within:[scrollbar-width:none] focus-within:[&::-webkit-scrollbar]:hidden"
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
          className="stack-marquee m-0 flex h-[122px] list-none flex-nowrap items-stretch gap-3 px-1 py-2 md:h-[132px] md:gap-4"
          aria-describedby="stack-inspect-hint"
        >
        {marqueeStacks.map((item, index) => {
          const Icon = item.Icon;
          return (
            <li
              key={`${item.name}-${index}`}
              aria-hidden={index >= stacks.length}
              tabIndex={index < stacks.length ? 0 : -1}
              aria-label={`${item.name}, ${item.category}`}
              className={`stack-card ${categoryAccent(item.category)}`}
            >
              <div className="premium-card stack-card-lid">
                <div className="stack-card-content">
                  <span className="stack-card-icon-shell">
                    <Icon className="stack-card-icon" aria-hidden />
                  </span>
                  <span className="stack-card-badge">{item.category}</span>
                  <div className="stack-card-name">{item.name}</div>
                </div>
              </div>
            </li>
          );
        })}
        </ul>
        <div
          id="stack-inspect-hint"
          className="stack-inspect-hint pointer-events-none absolute bottom-2 right-3 z-[2] hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/48 backdrop-blur-md transition-colors duration-200 md:inline-flex"
        >
          <PauseCircle className="size-3" aria-hidden />
          Hover to pause
        </div>
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
