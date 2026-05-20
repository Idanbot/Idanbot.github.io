import type { LucideIcon } from 'lucide-react';
import { Globe, Code2, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeviceStatus } from './DeviceStatus';

export const StatusPage = () => {
  return (
    <section className="border-t border-white/5 bg-muted/40 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">About this site</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">idanbot.me</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Static portfolio on GitHub Pages — no backend tracking here, just a fast single-page
            experience.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard
            title="Hosting"
            body="Deployed from the Idanbot.github.io repo to GitHub Pages with a custom domain."
            icon={Globe}
          />
          <InfoCard
            title="Stack"
            body="React, Vite, TypeScript, Tailwind CSS, and Framer Motion for interactions."
            icon={Code2}
          />
          <InfoCard
            title="Contact"
            body="Reach out via LinkedIn or email — links are in the hero and command palette (⌘K)."
            icon={Mail}
          />
        </div>

        <div className="my-12 border-t border-white/5" />

        <DeviceStatus />
      </div>
    </section>
  );
};

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
    <Card className="border-white/10 bg-card/50 transition-colors hover:bg-card/80">
      <CardContent className="flex gap-4 p-5 sm:p-6">
        <Icon className="mt-0.5 shrink-0 text-primary" size={22} />
        <div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
