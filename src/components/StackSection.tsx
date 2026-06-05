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
import { m } from 'framer-motion';
import { Award, ExternalLink, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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

const CREDLY_PCA =
  'https://www.credly.com/badges/58dc8f3f-2958-40eb-a2be-5584dfa2a9ec';

export const StackSection = ({ className }: { className?: string }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const marqueeStacks = prefersReducedMotion ? stacks : [...stacks, ...stacks];

  return (
    <section
      id="skills"
      className={`mx-auto max-w-6xl border-t border-white/5 px-4 py-14 sm:px-6 md:py-20 snap-start ${className ?? ''}`}
      aria-labelledby="skills-heading"
    >
      <m.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        viewport={{ once: true, margin: '-80px' }}
        className="mb-8 text-center md:mb-10"
      >
        <div className="mb-3 inline-flex items-center justify-center gap-2 text-primary/90">
          <Layers
            className="size-7 motion-safe:animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
        </div>
        <h2 id="skills-heading" className="mb-3 text-3xl font-bold md:text-4xl">
          Core <span className="text-gradient">Stack</span>
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Tools and platforms I use to ship reliable systems—from clusters to observability.
        </p>
      </m.div>

      <div
        className={
          prefersReducedMotion
            ? "relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "relative overflow-hidden"
        }
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-[var(--background)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-[var(--background)] to-transparent"
          aria-hidden
        />
        <m.ul
          className="m-0 flex h-[122px] list-none flex-nowrap items-stretch gap-3 px-1 py-2 will-change-transform md:h-[132px] md:gap-4"
          animate={prefersReducedMotion ? undefined : { x: ['0%', '-50%'] }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 42,
                  ease: 'linear',
                  repeat: Infinity,
                }
          }
        >
        {marqueeStacks.map((item, index) => {
          const Icon = item.Icon;
          return (
            <m.li
              key={`${item.name}-${index}`}
              aria-hidden={!prefersReducedMotion && index >= stacks.length}
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      delay: Math.min((index % stacks.length) * 0.03, 0.36),
                      type: 'spring',
                      stiffness: 380,
                      damping: 26,
                    }
              }
              className="list-none shrink-0"
            >
              <Card className="stack-card-lid group h-full w-[128px] border border-white/10 bg-card/60 backdrop-blur-sm transition-[border-color,box-shadow,background-color,filter] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/55 hover:bg-card/[0.93] hover:shadow-[0_10px_32px_-14px_color-mix(in_oklab,var(--primary),transparent)] max-sm:hover:border-primary/45 max-sm:hover:shadow-none max-sm:hover:brightness-[1.04] motion-reduce:transition-none md:w-[148px]">
                <CardContent className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center md:gap-2">
                  <span className="flex size-10 origin-center items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition-[background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:bg-primary/[0.12] group-hover:ring-primary/35 motion-reduce:group-hover:scale-100">
                    <Icon
                      className="size-5 text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-primary"
                      aria-hidden
                    />
                  </span>
                  <Badge
                    variant="muted"
                    className="font-mono text-[9px] uppercase tracking-wider transition-colors duration-150 ease-out group-hover:border-primary/40 group-hover:text-primary/90 sm:text-[10px]"
                  >
                    {item.category}
                  </Badge>
                  <div className="text-xs font-semibold leading-snug text-card-foreground transition-colors duration-150 ease-out group-hover:text-foreground sm:text-sm">
                    {item.name}
                  </div>
                </CardContent>
              </Card>
            </m.li>
          );
        })}
        </m.ul>
      </div>

      <m.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        viewport={{ once: true, margin: '-60px' }}
        className="mx-auto mt-6 max-w-2xl md:mt-8"
      >
        <Card className="border-white/10 bg-card/50 text-left transition-colors hover:border-primary/30 hover:bg-card/70">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
              <SiGooglecloud className="size-6 text-muted-foreground" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Award className="size-4 shrink-0 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-card-foreground sm:text-base">
                  Google Cloud Certified — Professional Cloud Architect
                </h3>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Issued <time dateTime="2026-02-18">18 February 2026</time>
                {' · '}
                Expires <time dateTime="2028-02-18">18 February 2028</time>
              </p>
              <a
                href={CREDLY_PCA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Verify on Credly
                <ExternalLink className="size-3.5 shrink-0 opacity-80" aria-hidden />
              </a>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </section>
  );
};
