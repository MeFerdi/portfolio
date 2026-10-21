# Content

All copy on the site lives in this folder as JSON. Components read it through
`lib/content.js` at build time, so you can change what the site says without touching
any component.

| File                       | What it holds                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `profile.json`             | Name, location, page titles, hero, about text and skills, contact block                                      |
| `sections.json`            | Section headings and navigation labels (in nav order), the technical reports intro, and report status notice |
| `experience.json`          | Employment entries, newest first                                                                             |
| `training.json`            | Training and apprenticeship entries                                                                          |
| `approach.json`            | The "Engineering standards" principles                                                                       |
| `articles.json`            | Articles listed under Research                                                                               |
| `open-source.json`         | Open-source pull requests. The section and its nav link appear once this has an entry                        |
| `research/<slug>.json`     | One technical report per file, shown at `/research/<slug>` and ordered by `id`                               |
| `case-studies/<slug>.json` | One case study per file, listed in the case-study repository                                                 |
| `webdev.json`              | The `/webdev` page                                                                                           |
| `brand.json`               | The `/brand` page                                                                                            |

Every file is checked when the site builds. If a field is missing or has the wrong type,
`npm run build` stops and names the file and the field, for example:

```
Invalid content in content/case-studies/acme.json:
  - period.end is required
  - links.repo must be a URL (https://..., mailto:, / or #)
```

## Adding a case study

1. Copy an existing file in `content/case-studies/` to `content/case-studies/<slug>.json`.
   The slug is lowercase words joined by hyphens, and it must equal the file name.
2. Fill in the fields below. Start with `"status": "draft"`.
3. Set `lifecycle` to `active` or `archived`. This is independent of `status`: lifecycle
   controls the repository section, while status controls whether a draft is public.
4. Run `npm run dev` and open http://localhost:3000/case-studies. Drafts are visible
   in development only.
5. When it reads well, set `"status": "published"` and run `npm run build`.

### Fields

| Field               | Required | Meaning                                                                                                                                             |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`              | yes      | Identifier; must match the file name without `.json`                                                                                                |
| `order`             | yes      | Number. Lower numbers appear first; ties sort by slug                                                                                               |
| `status`            | yes      | `"draft"` (shown in dev, hidden in production builds) or `"published"`                                                                              |
| `lifecycle`         | yes      | `"active"` or `"archived"`; determines which repository section contains the work                                                                   |
| `title`             | yes      | Card heading                                                                                                                                        |
| `client`            | yes      | Organisation the work was for; shown above the title                                                                                                |
| `role`              | yes      | Your role on the work (stored; not currently displayed)                                                                                             |
| `period`            | yes      | `{ "start": "YYYY-MM", "end": "YYYY-MM" }`; use `"end": null` for ongoing work (stored; not currently displayed)                                    |
| `summary`           | yes      | One or two sentences of context; shown as "Context"                                                                                                 |
| `problem`           | yes      | A paragraph; shown as "Problem"                                                                                                                     |
| `approach`          | yes      | Array of bullets. One bullet shows as a sentence, several as a list. `[]` hides it                                                                  |
| `outcomes`          | yes      | Array of `{ "label", "value", "evidence" }`. Each shows as its own row under its label; `evidence` is a URL that adds an "Evidence" link, or `null` |
| `security_and_data` | yes      | Array of bullets on data-safety or security work, shown as "Security and data". `[]` hides it                                                       |
| `stack`             | yes      | Technologies, shown as tags before `tags`                                                                                                           |
| `links.repo`        | yes      | Repository URL, or `null`                                                                                                                           |
| `links.live`        | yes      | Live site URL, or `null`                                                                                                                            |
| `links.commits`     | yes      | Array of `{ "label", "url" }`, one per commit or pull request. `[]` hides it                                                                        |
| `confidential`      | yes      | `true` hides `links.repo` and `links.commits` (the live link still shows)                                                                           |
| `tags`              | yes      | Topic tags, shown after `stack`                                                                                                                     |

Anything set to `null` or `[]` renders nothing: no empty heading, no broken link and no
placeholder text. Leave a field empty until you have the real thing.

### Example: adding commit links

```json
"links": {
  "repo": "https://github.com/MeFerdi/example",
  "live": null,
  "commits": [
    { "label": "Add composite index on payments(customer_id, created_at)", "url": "https://github.com/MeFerdi/example/commit/3f2a9c1" },
    { "label": "PR #42: Validate statement rows before reconciliation", "url": "https://github.com/MeFerdi/example/pull/42" }
  ]
}
```

Each commit becomes a link under the card, labelled with its `label`.

## Adding a technical report

Copy a file in `content/research/`, give it the next `id` (`"04"`) and a new `slug`
matching the file name. Set `github` to the repository URL once it is public; while it is
`null`, the report shows the `paper.repositoryPending` sentence from `sections.json`
(set that to `null` to show nothing).
Set `lifecycle` to `active` while the research is in progress or planned, and to
`archived` when it is complete or discontinued. Technical reports remain available at
`/research/<slug>` and are also indexed in `/case-studies`.
