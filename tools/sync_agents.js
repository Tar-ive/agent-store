#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const headers = {
  'User-Agent': 'langchain-md-agent-sync',
  Accept: 'application/vnd.github+json'
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} ${res.statusText} for ${url}`);
  }
  return res.text();
}

function extractSummary(markdown) {
  const lines = markdown
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('![') && !line.startsWith('<'));

  const body = [];
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const clean = line
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\[\]/g, '')
      .replace(/\[\s*\]/g, '')
      .replace(/\(https?:[^)]+\)/gi, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\<[^>]*\>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (clean.length === 0) continue;
    body.push(clean);
    if (body.join(' ').length > 400) break;
  }

  const summary = body.join(' ');
  return summary.slice(0, 500);
}

async function buildAgents() {
  const sourcesPath = path.join(dataDir, 'agent-sources.json');
  const sourcesRaw = await readFile(sourcesPath, 'utf8');
  const sourcesJson = JSON.parse(sourcesRaw);
  const { sources } = sourcesJson;

  const agents = [];
  for (const source of sources) {
    try {
      let repoData = {};
      let readmeInfo;
      let readmeText = '';

      if (source.repo) {
        repoData = await fetchJson(`https://api.github.com/repos/${source.repo}`);
        try {
          readmeInfo = await fetchJson(`https://api.github.com/repos/${source.repo}/readme`);
          if (readmeInfo && readmeInfo.download_url) {
            readmeText = await fetchText(readmeInfo.download_url);
          } else if (readmeInfo && readmeInfo.content) {
            const buff = Buffer.from(readmeInfo.content, 'base64');
            readmeText = buff.toString('utf8');
          }
        } catch (err) {
          readmeText = '';
        }
      }

      const staticData = source.static || {};
      const summary = staticData.summary || (readmeText ? extractSummary(readmeText) : repoData.description || '');

      agents.push({
        slug: source.slug,
        name: staticData.name || repoData.name || source.slug,
        full_name: repoData.full_name || (source.repo ?? ''),
        html_url: staticData.html_url || repoData.html_url || staticData.repo_url || '',
        default_branch: repoData.default_branch || staticData.default_branch || 'main',
        description: staticData.description || repoData.description || summary,
        summary,
        stars: staticData.stars ?? repoData.stargazers_count ?? 0,
        forks: staticData.forks ?? repoData.forks_count ?? 0,
        open_issues: staticData.open_issues ?? repoData.open_issues_count ?? 0,
        last_pushed: staticData.last_pushed || repoData.pushed_at || staticData.updated_at || null,
        homepage: staticData.homepage || repoData.homepage || '',
        license: staticData.license || (repoData.license ? repoData.license.spdx_id || repoData.license.name : null) || null,
        topics: staticData.topics || repoData.topics || [],
        source_readme: staticData.readme_url || readmeInfo?.download_url || null,
        frameworks: source.frameworks || staticData.frameworks || [],
        categories: source.categories || staticData.categories || [],
        capabilities: source.capabilities || staticData.capabilities || [],
        domains: source.domains || staticData.domains || [],
        status: source.status || staticData.status || 'unknown',
        deployments: source.deployments || staticData.deployments || [],
        pricing: source.pricing || staticData.pricing || null,
        reputation: source.reputation || staticData.reputation || null,
        metadata: staticData.metadata || {}
      });
    } catch (error) {
      console.error(`Failed to ingest ${source.slug}:`, error.message);
    }
  }

  const output = {
    generated_at: new Date().toISOString(),
    source_count: agents.length,
    agents
  };

  const outputPath = path.join(dataDir, 'agents.json');
  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${agents.length} agents to ${path.relative(rootDir, outputPath)}`);
}

buildAgents().catch(err => {
  console.error(err);
  process.exit(1);
});
