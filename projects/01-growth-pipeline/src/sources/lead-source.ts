import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { RawLeadSchema, type RawLead } from '../domain/lead';

/**
 * Where leads come from. Implementations must only use data the operator is
 * permitted to use: CRM exports, sign-up lists, permitted vendor APIs, or
 * companies' own public pages. Not LinkedIn scraping.
 */
export interface LeadSource {
  readonly name: string;
  /** Yields leads lazily so large sources don't need to fit in memory. */
  leads(): AsyncIterable<LeadSourceItem>;
}

export type LeadSourceItem = { ok: true; lead: RawLead } | { ok: false; index: number; error: string };

/** Reads a JSON array of lead objects, e.g. an export from a CRM. Invalid rows are reported, not thrown. */
export class JsonFileLeadSource implements LeadSource {
  readonly name: string;

  constructor(private readonly path: string) {
    this.name = `json-file:${path}`;
  }

  async *leads(): AsyncIterable<LeadSourceItem> {
    const rows = z.array(z.unknown()).parse(JSON.parse(await readFile(this.path, 'utf8')));
    for (const [index, row] of rows.entries()) {
      const withSource = typeof row === 'object' && row !== null ? { source: this.name, ...row } : row;
      const parsed = RawLeadSchema.safeParse(withSource);
      yield parsed.success
        ? { ok: true, lead: parsed.data }
        : { ok: false, index, error: z.prettifyError(parsed.error) };
    }
  }
}

/** TODO: implement against a permitted CRM API (e.g. HubSpot contacts) with cursor pagination. */
export class CrmApiLeadSource implements LeadSource {
  readonly name = 'crm-api';

  async *leads(): AsyncIterable<LeadSourceItem> {
    throw new Error('Not implemented: CrmApiLeadSource (next step: HubSpot contacts API with cursor pagination)');
  }
}
