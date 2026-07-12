export const labStack = [
  'Google Cloud',
  'AWS',
  'GKE',
  'Kubernetes',
  'Terraform',
  'Cloud SQL',
  'GitHub Actions',
  'Java / Spring',
  'Python',
  'PostgreSQL',
  'Observability',
  'Linux',
] as const;

export const practiceAreas = [
  {
    index: '01',
    title: 'Architecture',
    body: 'Cloud-native systems designed around security, operability, and cost-aware growth.',
  },
  {
    index: '02',
    title: 'Platforms',
    body: 'Reusable Kubernetes and Terraform foundations that make reliable delivery routine.',
  },
  {
    index: '03',
    title: 'Backend depth',
    body: 'Production debugging informed by hands-on Java, microservices, queues, and data systems.',
  },
] as const;

export const architectureNodes = [
  { label: 'EDGE', detail: 'DNS / LB', x: 12, y: 50 },
  { label: 'GKE', detail: 'runtime', x: 43, y: 30 },
  { label: 'CI/CD', detail: 'delivery', x: 43, y: 70 },
  { label: 'DATA', detail: 'Cloud SQL', x: 76, y: 28 },
  { label: 'SIGNALS', detail: 'metrics', x: 76, y: 72 },
] as const;
