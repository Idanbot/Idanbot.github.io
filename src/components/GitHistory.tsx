import { m } from 'framer-motion';
import { Building2, CalendarDays, GitBranch, Inbox, Tag } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const commits = [
  {
    hash: 'f6c4a21',
    msg: 'feat: Cloud Architect / DevOps Engineer',
    company: 'WideOps Ltd',
    date: 'Feb 2026 - Present',
    tag: 'v4.0.0',
    type: 'feat',
    accent: 'cloud',
    summary: 'Customer-facing cloud architecture and platform engineering at a Google Cloud Premier Partner.',
    highlights: [
      'Design and review cloud-native architectures on Google Cloud and AWS.',
      'Build secure GKE, Terraform, IAM, networking, Cloud SQL, Artifact Registry, and CI/CD patterns.',
      'Support discovery, modernization planning, cost optimization, and observability decisions.',
    ],
  },
  {
    hash: '8e7f2a1',
    msg: 'feat: DevOps Engineer Bootcamp',
    company: 'Infinity Labs R&D',
    date: '2025 - 2026',
    tag: 'v3.0.0',
    type: 'feat',
    accent: 'platform',
    summary: 'Intensive DevOps lifecycle training across cloud, GitOps, automation, and monitoring.',
    highlights: [
      'Practiced Kubernetes orchestration, AWS architecture, and Argo CD delivery workflows.',
      'Automated infrastructure and operations with Python, Ansible, and Linux tooling.',
      'Built monitoring flows with ELK, Prometheus, and production-style troubleshooting.',
    ],
  },
  {
    hash: '7f2a9c1',
    msg: 'feat: Software Engineer',
    company: 'Perion Network',
    date: '2022 - 2024',
    tag: 'v2.4.0',
    type: 'feat',
    accent: 'backend',
    summary: 'Backend engineering on high-throughput Java/Spring services connected to AWS systems.',
    highlights: [
      'Built and optimized microservices processing millions of daily requests.',
      'Worked with Java, Spring Boot, AWS EC2/EKS, and production backend operations.',
      'Implemented event-driven flows with RabbitMQ and SQS for resilient async processing.',
    ],
  },
  {
    hash: 'b4d8e2f',
    msg: 'docs: DevOps Introduction Course',
    company: 'John Bryce',
    date: '2022',
    tag: 'v1.5.0',
    type: 'chore',
    accent: 'delivery',
    summary: 'Foundational systems, scripting, and containerization training.',
    highlights: [
      'Covered Linux administration, shell scripting, Docker, and Kubernetes basics.',
      'Connected infrastructure fundamentals with practical deployment workflows.',
    ],
  },
  {
    hash: 'c9a1b3d',
    msg: 'init: Full Stack Developer Bootcamp',
    company: 'John Bryce',
    date: '2021 - 2022',
    tag: 'v1.0.0',
    type: 'init',
    accent: 'data',
    summary: 'Full-stack foundation across Java backend, React frontend, and SQL databases.',
    highlights: [
      'Built applications with Java Spring Boot, React, Redux, and relational schemas.',
      'Developed the backend foundation that now supports platform and cloud architecture work.',
    ],
  },
];

export const GitHistory = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (commits.length === 0) {
    return (
      <div
        className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-card/40 p-10 text-center font-mono"
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

            <article className="group rounded-xl premium-card border border-white/10 bg-card/50 p-4 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-cloud/25 hover:bg-white/[0.045] sm:p-5">
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
