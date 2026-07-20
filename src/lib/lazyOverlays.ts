export const loadTerminalModal = () =>
  import('../components/TerminalModal').then((mod) => ({ default: mod.TerminalModal }));
export const loadCommandPalette = () =>
  import('../components/CommandPalette').then((mod) => ({ default: mod.CommandPalette }));
export const loadStatusPage = () =>
  import('../components/StatusPage').then((mod) => ({ default: mod.StatusPage }));

export const prefetchOnFirstIntent = (
  event: PointerEvent | FocusEvent,
  loader: () => Promise<unknown>
) => {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.prefetched === 'true') return;
  target.dataset.prefetched = 'true';
  void loader();
};
