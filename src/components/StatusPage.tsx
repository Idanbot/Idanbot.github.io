import type { LucideIcon } from 'lucide-react';
import { Activity, Code2, Globe, Gauge, Radio, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeviceStatus } from './DeviceStatus';

const healthMetrics = [
  { label: 'Runtime', value: 'Static', detail: 'GitHub Pages', icon: Globe },
  { label: 'Delivery', value: 'Vite', detail: 'Prerendered build', icon: Gauge },
  { label: 'Telemetry', value: 'Live', detail: 'Device heartbeats', icon: Radio },
  { label: 'Privacy', value: 'No tracking', detail: 'Client-only page', icon: ShieldCheck },
];

const siteCards = [
  {
    title: 'Hosting',
    body: 'Deployed from the Idanbot.github.io repo to GitHub Pages with a custom domain.',
    icon: Globe,
  },
  {
    title: 'Stack',
    body: 'React, Vite, TypeScript, Tailwind CSS, and Framer Motion for focused interactions.',
    icon: Code2,
  },
  {
    title: 'Heartbeat Feed',
    body: 'Live device state is fetched from a small worker endpoint with local cache fallback.',
    icon: Activity,
  },
];

export const StatusPage = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.16),transparent_58%)]" />
      <div className="site-content-width relative mx-auto">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-cloud/80">
            Production surface
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Live <span className="text-gradient">System Monitor</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A lightweight status layer for this static portfolio: deployment context, runtime health,
            and live heartbeat checks in one place.
          </p>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {healthMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {siteCards.map((card) => (
            <InfoCard key={card.title} {...card} />
          ))}
        </div>

        <div className="my-10 border-t border-white/5 sm:my-12" />

        <div className="liquid-glass rounded-2xl p-4 sm:p-6">
          <DeviceStatus />
        </div>
      </div>
    </section>
  );
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="liquid-glass rounded-2xl border-white/10 bg-card/45">
      <CardContent className="relative z-[1] flex items-start gap-3 p-4 sm:p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-cloud ring-1 ring-white/10">
          <Icon size={17} aria-hidden />
        </span>
        <div className="min-w-0 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-base font-semibold text-white sm:text-lg">{value}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="premium-card rounded-2xl border-white/10 bg-card/45 transition-colors hover:bg-white/[0.045]">
      <CardContent className="relative z-[1] flex gap-4 p-5 sm:p-6">
        <Icon className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden />
        <div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
