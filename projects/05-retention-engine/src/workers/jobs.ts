/** Payload for the diagnose and deliver queues: everything else is loaded from the DB by key. */
export interface InterventionJob {
  interventionKey: string;
}

export const QUEUES = {
  events: 'events',
  stallScan: 'stall-scan',
  diagnose: 'diagnose-and-draft',
  deliver: 'deliver',
} as const;
