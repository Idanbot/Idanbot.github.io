import { m } from 'framer-motion';
import { GitBranch, Inbox, Tag } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const commits = [
  {
    hash: '8e7f2a1',
    msg: 'feat: DevOps Engineer Bootcamp @ Infinity Labs R&D',
    date: '2025 - 2026',
    tag: 'v3.0.0',
    type: 'feat',
    details: 'Intensive mastery of the full DevOps lifecycle. Expertise in Kubernetes orchestration, AWS cloud architecture, and GitOps pipelines using ArgoCD. Advanced automation with Python/Ansible and monitoring with ELK/Prometheus stack.'
  },
  {
    hash: '7f2a9c1',
    msg: 'feat: Software Engineer @ Perion Network',
    date: '2022 - 2024',
    tag: 'v2.4.0',
    type: 'feat',
    details: 'Architected high-throughput microservices processing millions of daily requests. Optimized Java/Spring Boot services on AWS EC2/EKS. Implemented event-driven patterns with RabbitMQ/SQS for resilient asynchronous communication.'
  },
  {
    hash: 'b4d8e2f',
    msg: 'docs: DevOps Introduction Course @ John Bryce',
    date: '2022',
    tag: 'v1.5.0',
    type: 'chore',
    details: 'Foundational training in Linux system administration, shell scripting, and containerization fundamentals with Docker & Kubernetes.'
  },
  {
    hash: 'c9a1b3d',
    msg: 'init: Full Stack Developer Bootcamp @ John Bryce',
    date: '2021 - 2022',
    tag: 'v1.0.0',
    type: 'init',
    details: 'Comprehensive full-stack development. Built production-grade applications using Java Spring Boot, React, Redux, and complex SQL database schemas.'
  }
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

  return (
    <div className="mx-auto max-w-4xl p-6 font-mono">
      <div className="mb-8 flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
        <GitBranch className="text-primary/90" size={18} aria-hidden />
        <span className="text-foreground/90">main</span>
      </div>

      <div className="relative ml-3 space-y-12 border-l-2 border-border">
        {commits.map((commit, index) => (
          <m.div
            key={commit.hash}
            initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08 }}
            className="relative pl-8"
          >
            <div
              className={`absolute -left-[9px] top-0 size-4 rounded-full ${nodeClass(commit.type)}`}
              aria-hidden
            />

            <div className="group cursor-pointer">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-sm text-primary">{commit.hash}</span>
                <span className="text-xs text-muted-foreground">({commit.date})</span>
                {commit.tag && (
                  <span className="flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 text-xs text-card-foreground">
                    <Tag size={10} aria-hidden /> {commit.tag}
                  </span>
                )}
              </div>

              <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {commit.msg}
              </h3>

              <p className="rounded border border-border bg-card/50 p-4 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:bg-card/70">
                {commit.details}
              </p>
            </div>
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
