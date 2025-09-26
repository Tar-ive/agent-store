# Ops Field Agent

Automation harness that keeps LangChain.md deployments consistent:

```bash
# One-time setup (token/project/team slugs)
export VERCEL_TOKEN=xxxx
export VERCEL_PROJECT=langchain-md
export VERCEL_ORG=tarive

# Execute the ops agent
./tools/ops-agent/run_ops_agent.sh
```

Tasks performed:
1. `vercel link` the current repository to the configured project (non-interactive `--yes`).
2. `vercel analytics enable` to ensure Web Analytics is active for the project.
3. `vercel deploy --prod` for a production build.

The script writes a run log to `ops-agent.log` in the repo root. Reruns are idempotent.
