const variants = {
  skills:
    'cv-skills mx-auto min-h-[300px] max-w-5xl snap-start rounded-2xl border border-white/5 bg-white/[0.02]',
  history:
    'min-h-[760px] max-w-4xl mx-auto rounded-2xl border border-white/5 bg-white/[0.02] md:min-h-[820px]',
  monitor:
    'min-h-[680px] max-w-5xl mx-auto rounded-2xl border border-white/5 bg-white/[0.02] px-4 sm:px-6 md:min-h-[760px]',
} as const;

const previews = {
  skills: {
    eyebrow: 'Core stack',
    title: 'Cloud platforms, delivery, and observability.',
    body: 'Kubernetes, Terraform, GCP, AWS, CI/CD, and production systems.',
    labels: ['GCP', 'AWS', 'Kubernetes', 'Terraform'],
  },
  history: {
    eyebrow: 'Professional trajectory',
    title: 'Cloud architecture with backend depth.',
    body: 'Current platform work, DevOps training, and Java/Spring production systems.',
    labels: ['WideOps', 'Platform', 'Backend'],
  },
  monitor: {
    eyebrow: 'Live system monitor',
    title: 'Heartbeat data is ready to load.',
    body: 'Deployment context and live machine health appear when this section enters view.',
    labels: ['GitHub Pages', 'Heartbeat API', 'Client cache'],
  },
} as const;

export function SectionSkeleton({ variant }: { variant: keyof typeof variants }) {
  const preview = previews[variant];

  return (
    <div className={`${variants[variant]} flex items-center`} aria-busy="true">
      <div className="w-full p-6 text-center sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cloud/75">{preview.eyebrow}</p>
        <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{preview.title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{preview.body}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {preview.labels.map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white/60">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
