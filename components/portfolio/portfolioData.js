// Content for the three portfolio pillars: research, case studies and open source.
// A pillar's section and navigation link appear only when its list has an entry, so
// nothing is shown before it exists. State a result only once it has been measured.

// Technical reports and specifications, in build order. Each is presented as a paper
// at /research/<slug>. Until results are measured, a paper describes the study design
// only. Set `github` to the repository once it is public.
export const research = [
  {
    id: '01',
    slug: 'extraction-and-deterministic-reconciliation',
    date: 'October 2026',
    abstract:
      'Language models are increasingly used to read unstructured financial documents, yet their outputs are probabilistic and difficult to audit. This study separates the two tasks involved in reconciliation. A language model extracts transactions from mobile money, bank and sales representative statements into a validated schema, and a deterministic rule decides whether each transaction matches an invoice. The study measures whether extraction under this arrangement is accurate enough for reconciliation, and at what cost and latency.',
    sections: [
      {
        heading: 'Motivation',
        body: [
          'Distributors reconcile payments received through several channels against the invoices they have issued. The statements arrive in inconsistent formats, and manual reconciliation is slow and prone to error. A language model can read these formats, but a reconciliation decision made by a model cannot be explained or reproduced with the certainty that financial records require.',
        ],
      },
      {
        heading: 'Research question',
        body: [
          'Whether a language model can extract transactions from mobile money, bank and sales representative statements with sufficient accuracy for reconciliation, when every matching decision is reserved for a deterministic rule.',
        ],
      },
      {
        heading: 'Method',
        body: [
          'A labelled evaluation set of statements is prepared, with the expected transactions recorded for each. Each model version extracts transactions into a schema, and records that fail validation are routed to manual review rather than reconciled. A deterministic matcher then pairs the extracted transactions with invoices. Results are compared across model versions with all other conditions held constant.',
        ],
      },
      {
        heading: 'Measures',
        list: [
          'Field-level extraction accuracy for amount, date, reference and counterparty.',
          'Reconciliation match rate against the labelled expectation.',
          'Proportion of records routed to manual review.',
          'Cost per statement and p95 latency for each model version.',
        ],
      },
      {
        heading: 'Deliverables',
        body: ['A specification of the matching rule, an evaluation report and a reference implementation.'],
      },
    ],
    title: 'Language Model Extraction with Deterministic Reconciliation of Financial Statements',
    type: 'Technical report and specification',
    status: 'In progress',
    question:
      'Whether a language model can extract transactions from mobile money, bank and sales representative statements with sufficient accuracy for reconciliation, when every matching decision is reserved for a deterministic rule.',
    method:
      'A labelled evaluation set measures field-level extraction accuracy and the reconciliation match rate across model versions, together with cost per statement and p95 latency.',
    deliverables: 'A specification of the matching rule, an evaluation report and a reference implementation.',
    tags: ['Structured extraction', 'Reconciliation', 'Evaluation', 'TypeScript', 'PostgreSQL'],
    github: null,
  },
  {
    id: '02',
    slug: 'ledger-question-answering',
    date: 'October 2026',
    abstract:
      'Question answering over financial records is useful only when every answer can be traced to the records that support it. This study examines an assistant that answers plain-language questions about a reconciled ledger, cites the ledger rows on which each answer relies, and declines to answer when the evidence is insufficient. It compares retrieval with and without reranking, and measures faithfulness and the accuracy of refusals.',
    sections: [
      {
        heading: 'Motivation',
        body: [
          'Business owners and accountants ask questions of their records in plain language. An assistant that answers fluently but without evidence is a liability in a financial setting. The design therefore treats a cited refusal as a correct outcome whenever the ledger does not support an answer.',
        ],
      },
      {
        heading: 'Research question',
        body: [
          'The effect of hybrid search and reranking on retrieval quality over financial records, and the conditions under which an assistant correctly declines to answer for lack of evidence.',
        ],
      },
      {
        heading: 'Method',
        body: [
          'A reference set of questions is prepared over the reconciled ledger produced by the first study, each with its supporting rows or an expected refusal. Two retrieval configurations, hybrid search with and without reranking, are evaluated against the same set. An answer is withheld when any of its citations cannot be resolved to a ledger row. The evaluation suite runs in continuous integration on every commit.',
        ],
      },
      {
        heading: 'Measures',
        list: [
          'Retrieval recall of the supporting rows.',
          'Citation accuracy.',
          'Answer faithfulness to the cited rows.',
          'Refusal accuracy on questions the ledger cannot answer.',
        ],
      },
      {
        heading: 'Deliverables',
        body: ['An evaluation report, the evaluation dataset and the evaluation harness.'],
      },
    ],
    title: 'Retrieval Quality, Faithfulness and Refusal in Question Answering over a Reconciled Ledger',
    type: 'Technical report',
    status: 'Planned',
    question:
      'The effect of hybrid search and reranking on retrieval quality over financial records, and the conditions under which an assistant correctly declines to answer for lack of evidence.',
    method:
      'A comparative evaluation with and without reranking that measures retrieval recall, citation accuracy, answer faithfulness and refusal accuracy, run in continuous integration on every commit.',
    deliverables: 'An evaluation report, the evaluation dataset and the evaluation harness.',
    tags: ['Hybrid search', 'Reranking', 'pgvector', 'Model-graded evaluation'],
    github: null,
  },
  {
    id: '03',
    slug: 'prompt-injection-financial-documents',
    date: 'October 2026',
    abstract:
      'Financial documents carry free text, such as statement memos and invoice descriptions, that a language model agent reads as part of its input. This study treats that text as an attack surface. It tests whether instructions concealed in such documents can cause the systems from the two preceding studies to disclose data or to call tools beyond their permissions, and it evaluates authorisation enforced outside the model as the principal control.',
    sections: [
      {
        heading: 'Motivation',
        body: [
          'An agent that processes documents from third parties receives input that its operator does not control. Where that agent has access to financial records or to actions, a successful injection has direct consequences. Controls that rely on the model to refuse are not sufficient on their own.',
        ],
      },
      {
        heading: 'Research question',
        body: [
          'The extent to which instructions concealed in statement memos and invoice text can cause data exfiltration or unauthorised tool calls, and the controls that prevent them.',
        ],
      },
      {
        heading: 'Method',
        body: [
          'A threat model enumerates the attack classes relevant to the two systems. A red-team suite contains at least one automated test for each class and runs against the production model configuration. Authorisation is enforced by a policy layer outside the model, and the suite records whether each attack was prevented by the model, by the policy layer or not at all.',
        ],
      },
      {
        heading: 'Measures',
        list: [
          'Attack success rate by attack class and model version.',
          'Proportion of attacks stopped by the policy layer rather than the model.',
          'Data disclosed and actions attempted in each successful attack.',
        ],
      },
      {
        heading: 'Deliverables',
        body: ['A threat model, the attack suite and a report of results by model version.'],
      },
    ],
    title: 'Prompt Injection through Financial Documents: An Attack Study of Two Language Model Agents',
    type: 'Technical report and threat model',
    status: 'Planned',
    question:
      'The extent to which instructions concealed in statement memos and invoice text can cause data exfiltration or unauthorised tool calls, and the controls that prevent them.',
    method:
      'A red-team suite with at least one test for each documented attack class, run against the production model configuration of the two preceding systems. Authorisation is enforced by a policy layer outside the model.',
    deliverables: 'A threat model, the attack suite and a report of results by model version.',
    tags: ['Prompt injection', 'Authorisation', 'Threat modelling', 'Red-team testing'],
    github: null,
  },
];

export const articles = [
  {
    href: 'https://dev.to/ferdinandodhiambo/cache-invalidation-the-silent-performance-killer-1fl8',
    title: 'Cache Invalidation: The Silent Performance Killer',
    meta: 'Dev.to · Backend Systems',
  },
  {
    href: 'https://dev.to/ferdinandodhiambo/mastering-cors-in-golang-a-comprehensive-guide-25h2',
    title: 'Mastering CORS in Golang: A Comprehensive Guide',
    meta: 'Dev.to · Go',
  },
  {
    href: 'https://dev.to/ferdinandodhiambo/leveraging-axios-interceptors-in-nextjs-4hi',
    title: 'Leveraging Axios Interceptors in Next.js',
    meta: 'Dev.to · JavaScript',
  },
];

// System design and impact case studies from production work. Client work appears
// only with the client's written permission. Set `link` to the full write-up.
export const caseStudies = [
  {
    title: 'Query Latency Reduction on a High-Volume PostgreSQL Table',
    organisation: 'Zone01 Kisumu',
    context: 'Backend services for a talent management platform, including REST APIs, candidate management and evaluation workflows.',
    problem: 'Queries against a table with a high row count were slow enough to affect the responsiveness of the platform.',
    approach: 'Query plans were analysed with EXPLAIN ANALYZE, which identified sequential scans on the affected queries. Targeted indexes were added for the access patterns concerned.',
    result: 'Query latency on the affected table was reduced by 20 per cent.',
    tags: ['PostgreSQL', 'Query planning', 'Indexing'],
    link: null,
  },
];

// Contributions to external open-source projects. Add an entry once a pull request
// is opened; set `status` to 'Merged' and `link` to the pull request.
export const openSource = [];

export const sections = [
  { id: 'about', label: 'About', show: true },
  { id: 'research', label: 'Research', show: research.length > 0 },
  { id: 'case-studies', label: 'Case studies', show: caseStudies.length > 0 },
  { id: 'open-source', label: 'Open source', show: openSource.length > 0 },
  { id: 'work', label: 'Experience', show: true },
  { id: 'training', label: 'Training', show: true },
  { id: 'contact', label: 'Contact', show: true },
].filter((section) => section.show);

export function findPaper(slug) {
  return research.find((report) => report.slug === slug);
}
