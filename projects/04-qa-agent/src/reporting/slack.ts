import { type BugReport, shortSha, truncate } from './bug-report';
import type { Notifier } from './notifier';
import { type PostOptions, postJson } from './webhook';

// Block Kit limits: header text 150 chars, section text 3000 chars.
const HEADER_MAX = 150;
const SECTION_MAX = 3000;

type TextObject = { type: 'mrkdwn' | 'plain_text'; text: string };
export type SlackBlock =
  | { type: 'header'; text: TextObject }
  | { type: 'section'; text?: TextObject; fields?: TextObject[] }
  | { type: 'context'; elements: TextObject[] }
  | { type: 'divider' };

export interface SlackMessage {
  /** Fallback for notifications and clients that do not render blocks. */
  text: string;
  blocks: SlackBlock[];
}

function md(text: string): TextObject {
  return { type: 'mrkdwn', text: truncate(text, SECTION_MAX) };
}

function section(text: string): SlackBlock {
  return { type: 'section', text: md(text) };
}

/** Pure: same report in, same message out. Snapshot-tested. */
export function buildSlackMessage(report: BugReport): SlackMessage {
  const { event, diagnosis } = report;
  const name = event.titlePath.length > 0 ? event.titlePath.join(' › ') : event.title;
  const blocks: SlackBlock[] = [
    { type: 'header', text: { type: 'plain_text', text: truncate(`E2E failure: ${event.title}`, HEADER_MAX) } },
    {
      type: 'section',
      fields: [
        md(`*Test*\n${name}`),
        md(`*File*\n\`${event.file}\``),
        md(`*Commit*\n\`${shortSha(event.gitSha)}\``),
        md(`*AI confidence*\n${diagnosis ? diagnosis.confidence : 'n/a'}`),
      ],
    },
  ];

  if (report.occurrences > 1) {
    blocks.push(section(`:repeat: Seen *${report.occurrences} times* between ${report.firstSeen} and ${report.lastSeen}.`));
  }

  if (diagnosis) {
    blocks.push(section(`*Summary*\n${diagnosis.summary}`));
    blocks.push(section(`*Likely root cause*\n${diagnosis.likelyRootCause}`));
    if (diagnosis.suspectedFiles.length > 0) {
      blocks.push(section(`*Suspected files*\n${diagnosis.suspectedFiles.map((f) => `• \`${f.path}\` — ${f.reason}`).join('\n')}`));
    }
    blocks.push(section(`*Suggested next step*\n${diagnosis.suggestedNextStep}`));
  } else {
    blocks.push(section(`:warning: *AI diagnosis unavailable* (${report.diagnosisError ?? 'unknown error'}). Raw failure below.`));
  }

  blocks.push({ type: 'divider' });
  blocks.push(section(`*Assertion error*\n\`\`\`${truncate(event.error.message, 1500)}\`\`\``));

  const context: TextObject[] = [md(`run \`${event.runId}\` · retry ${event.retry} · ${event.timestamp}`)];
  if (event.tracePath) context.push(md(`trace: \`${event.tracePath}\``));
  if (report.droppedPaths.length > 0) {
    context.push(md(`${report.droppedPaths.length} suggested path(s) not found in the repo were removed; confidence lowered.`));
  }
  blocks.push({ type: 'context', elements: context });

  const fallback = diagnosis
    ? `E2E failure: ${event.title}. ${diagnosis.summary}`
    : `E2E failure: ${event.title}. ${event.error.message}`;
  return { text: truncate(fallback, SECTION_MAX), blocks };
}

export class SlackNotifier implements Notifier {
  readonly name = 'slack';

  constructor(
    private readonly webhookUrl: string,
    private readonly postOptions: PostOptions = {},
  ) {}

  async send(report: BugReport): Promise<void> {
    await postJson(this.webhookUrl, buildSlackMessage(report), this.postOptions);
  }
}
