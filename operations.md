# Operations Roadmap – LangChain.md Agent Hub

## 1. LLM Search Agent Research Program
### Stage 1 – Landscape & Crawl Tests (Week 1–2)
- **Map crawler capabilities**: document how ChatGPT Browsing, Claude 3.5, Perplexity AI, Bing Deep Search, Brave, and other agentic systems ingest sites (text vs. JSON, requirement for auth, crawl rate limits).
- **Baseline experiments**: publish controlled test pages (hero copy, FAQ, JSON-LD variations) and request summaries from each agent to collect raw citations.
- **Log evidence**: capture prompts → responses, note which metadata fields each agent reads (title, meta description, headings, structured data, `LLM.txt`).

### Stage 2 – Content Optimisation Sprints (Week 3–4)
- **Modular content blocks**: create TL;DR summaries, canonical install snippets, and FAQ sections for top agents.
- **Structured data rollout**: add `SoftwareApplication`, `Organization`, and `HowTo` JSON-LD on listing pages; validate with Google Rich Results + manual agent tests.
- **Citation hooks**: craft quotable sentences (stats, comparisons, best practices) that LLMs can quote verbatim with attribution.

### Stage 3 – Feed & API Exposure (Week 5–6)
- **`/api/agents` prototype**: serve JSON with agent metadata (`name`, `frameworks`, `capabilities`, `repo`, `licence`, `updated_at`).
- **Change log**: publish `/updates` with timestamped entries so crawlers detect freshness.
- **Agent bundles**: offer zipped Markdown+JSON for offline RAG ingestion (include licence + contact for attribution).

### Stage 4 – Measurement Loop (Week 7+)
- **Analytics instrumentation**: tag inbound traffic with query params; log `User-Agent` patterns connected to ChatGPT, Claude, Perplexity, Bing, etc.
- **Question tracking**: maintain spreadsheet of prompts that return LangChain.md mentions; set review cadence (weekly) to spot drift or misinformation.
- **Feedback pipeline**: invite maintainers to submit performance reports (citations, conversions) via form or GitHub issue template.

## 2. Site Improvements Aligned With Research
- **LLM-first navigation**: keep top-level sections simple (`Agents`, `Playbooks`, `Submit`, `Changelog`).
- **Content primitives**: add `TL;DR`, `Why it matters`, `How to deploy`, `Safety notes` to each agent page for machine-readable segmentation.
- **Accessibility**: ensure ARIA labels, descriptive alt text, and high-contrast colours for inclusive consumption.
- **Cache headers**: serve static pages with stale-while-revalidate hints to encourage crawler freshness.
- **Robots policy**: keep `User-agent: *` access open; consider priority hints for `/agents` and `LLM.txt` once sitemap is generated.

## 3. Plexity/Perplexity API Notes
- Build endpoint compatibility: Perplexity accepts `Perplexity-Client` header for analytics; store anonymised stats server-side.
- Provide condensed bullet answers to match Perplexity's preference for direct, cited snippets.
- Publish debug log of how Perplexity interprets `LLM.txt`; share findings with community.

## 4. Enabling Vercel Analytics via CLI
1. **Install/Update Vercel CLI**
   ```bash
   npm install --global vercel
   ```
2. **Authenticate**
   ```bash
   vercel login
   ```
   Follow the browser prompt; ensure you are in the account that hosts langchain.md.
3. **Link the project (inside repo root)**
   ```bash
   vercel link
   ```
   - Select the existing Vercel project.
   - Accept the suggested settings or specify the root directory.
4. **Enable Web Analytics**
   ```bash
   vercel analytics enable
   ```
   - Confirms billing tier (Web Analytics is free on Pro+, trial on Hobby for 14 days).
   - CLI creates/updates the analytics configuration and sets `VERCEL_ANALYTICS_ID` automatically.
5. **Deploy to activate**
   ```bash
   vercel deploy --prod
   ```
   After deployment, Web Analytics starts collecting data; expect metrics within a few minutes.
6. **Verify in dashboard**
   - Visit `https://vercel.com/<account>/<project>/analytics`.
   - Ensure the new deployment shows "Collecting data" status.
7. **Instrument custom events (optional)**
   - Use Vercel's [Analytics SDK](https://vercel.com/docs/analytics) or append query params (`?source=chatgpt`) to identify agent referrals.
   - Store detections of AI-specific `User-Agent` values (e.g., `Mozilla/5.0 (ChatGPT...)`) for richer reporting.

### Troubleshooting
- If CLI warns about plan limits, upgrade the project to a plan that includes Web Analytics.
- For multi-environment setups, run `vercel analytics enable --scope <team>` or set the `--yes` flag for non-interactive scripts.
- To disable analytics, run `vercel analytics disable` and redeploy.

## 5. Immediate Next Steps
- Finalise sitemap + `robots.txt` entries referencing `LLM.txt` and upcoming `/api/agents` feed.
- Draft submission form questions and GitHub issue template.
- Begin Stage 1 research experiments (collect baseline citations by 7-day cadence).
- Schedule Vercel analytics activation and tag inbound agent experiments with unique URLs for attribution.

## 6. RPC Interface Rollout Checklist
- Publish `descriptor.proto` at the site root and expose checksum via `descriptor.sha256`.
- Extend `tools/sync_agents.js` outputs to populate pricing, deployments, and reputation (done for sample sources).
- Implement `AgentDirectory` gRPC service backed by `data/agents.json`; deploy behind QUIC + JWT bearer auth.
- Add CI step to regenerate descriptor and run `buf lint` / `buf breaking` checks (gate merges on schema changes).
- Document client usage in `rpc.md` and ensure legacy HTML links clearly point to the RPC-first flow.
- Use `./tools/ops-agent/run_ops_agent.sh` to script `vercel link`, enable Web Analytics, and push production deploys (requires `VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_ORG`).
- Each HTML page now includes `<script defer src="/_vercel/insights/script.js"></script>` so Web Analytics runs natively without extra bundling.
