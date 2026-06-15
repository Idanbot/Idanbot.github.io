const variants = {
  skills:
    'cv-skills mx-auto min-h-[300px] max-w-5xl snap-start rounded-xl border border-white/5 bg-white/[0.02]',
  history:
    'min-h-[760px] max-w-4xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] md:min-h-[820px]',
  monitor:
    'min-h-[680px] max-w-5xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] px-4 sm:px-6 md:min-h-[760px]',
} as const;

export function SectionSkeleton({ variant }: { variant: keyof typeof variants }) {
  return <div className={`${variants[variant]} animate-pulse`} />;
}
