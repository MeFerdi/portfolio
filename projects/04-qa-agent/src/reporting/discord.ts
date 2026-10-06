import { type BugReport, shortSha, truncate } from './bug-report';
import type { Notifier } from './notifier';
import { type PostOptions, postJson } from './webhook';

// Discord embed limits.
const TITLE_MAX = 256;
const DESCRIPTION_MAX = 4096;
const FIELD_MAX = 1024;

const COLORS = { high: 0xd73a49, medium: 0xf66a0a, low: 0xdbab09, none: 0x6a737d } as const;

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  footer: { text: string };
  timestamp: string;
}

export interface DiscordMessage {
  username: string;
  embeds: DiscordEmbed[];
}

function field(name: string, value: string, inline = false) {
  return { name, value: truncate(value, FIELD_MAX), inline };
}

/** Pure: same report in, same message out. Snapshot-tested. */
export function buildDiscordMessage(report: BugReport): DiscordMessage {
  const { event, diagnosis } = report;
  const fields = [
    field('File', `\`${event.file}\``, true),
    field('Commit', `\`${shortSha(event.gitSha)}\``, true),
    field('AI confidence', diagnosis ? diagnosis.confidence : 'n/a', true),
  ];
  if (report.occurrences > 1) {
    fields.push(field('Occurrences', `${report.occurrences} (${report.firstSeen} → ${report.lastSeen})`));
  }
  if (diagnosis) {
    fields.push(field('Likely root cause', diagnosis.likelyRootCause));
    if (diagnosis.suspectedFiles.length > 0) {
      fields.push(field('Suspected files', diagnosis.suspectedFiles.map((f) => `• \`${f.path}\` — ${f.reason}`).join('\n')));
    }
    fields.push(field('Suggested next step', diagnosis.suggestedNextStep));
  }
  fields.push(field('Assertion error', `\`\`\`${truncate(event.error.message, FIELD_MAX - 10)}\`\`\``));

  const description = diagnosis
    ? diagnosis.summary
    : `AI diagnosis unavailable (${report.diagnosisError ?? 'unknown error'}). Raw failure below.`;
  const dropped = report.droppedPaths.length > 0 ? ` · ${report.droppedPaths.length} hallucinated path(s) removed` : '';

  return {
    username: 'QA Agent',
    embeds: [
      {
        title: truncate(`E2E failure: ${event.title}`, TITLE_MAX),
        description: truncate(description, DESCRIPTION_MAX),
        color: diagnosis ? COLORS[diagnosis.confidence] : COLORS.none,
        fields,
        footer: { text: `run ${event.runId} · retry ${event.retry}${dropped}` },
        timestamp: event.timestamp,
      },
    ],
  };
}

export class DiscordNotifier implements Notifier {
  readonly name = 'discord';

  constructor(
    private readonly webhookUrl: string,
    private readonly postOptions: PostOptions = {},
  ) {}

  async send(report: BugReport): Promise<void> {
    await postJson(this.webhookUrl, buildDiscordMessage(report), this.postOptions);
  }
}
