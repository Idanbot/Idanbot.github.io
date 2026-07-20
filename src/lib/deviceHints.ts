type NavigatorWithHardwareHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export const isConstrainedDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithHardwareHints;
  return Boolean(
    nav.connection?.saveData ||
      (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
  );
};
