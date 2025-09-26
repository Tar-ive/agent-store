# LangChain.md RPC Interface

> Agents don’t browse. They call `ListSkills()`.

This document defines the gRPC-first contract for exposing the LangChain.md catalog to orchestrators, autonomous agents, and marketplaces. The protobuf descriptor must be published at `https://langchain.md/descriptor.proto`.

## Service Overview

```proto
syntax = "proto3";
package langchainmd.directory.v1;
option go_package = "github.com/tarive/langchain-md/rpc/directory;directory";
option java_multiple_files = true;
option java_outer_classname = "LangChainMdDirectoryProto";
option java_package = "ai.langchainmd.directory.v1";

service AgentDirectory {
  rpc ListSkills(ListSkillsRequest) returns (ListSkillsResponse);
  rpc GetSkill(GetSkillRequest) returns (Skill);
  rpc StreamSkillEvents(StreamSkillEventsRequest) returns (stream SkillEvent);
}
```

### ListSkills
- `filter`: optional free-form string (e.g. `"langchain AND multi-agent"`).
- `frameworks`: repeated canonical framework identifiers (`langchain`, `langgraph`, `autogen`, `crewai`).
- `capabilities`: repeated value from the controlled vocabulary (`document_qa`, `orchestration`, `retrieval`, `evaluation`, `devops`).
- `status`: optional status filters (`active`, `archived`, `beta`).
- `page_token` / `page_size`: standard pagination.

Returns `Skill[]` enriched with deployment, pricing, and reputation metadata so a consuming orchestrator can evaluate compatibility without scraping HTML.

### GetSkill
Fetch a single skill by slug or full repo name.

### StreamSkillEvents
Server stream for deltas (insert/update/archive) hashed against the public SLA manifest. Allows agent marketplaces to subscribe and keep their index hot without repeated `ListSkills` scans.

## Messages

```proto
message ListSkillsRequest {
  string filter = 1;
  repeated string frameworks = 2;
  repeated string capabilities = 3;
  repeated string status = 4;
  Pagination pagination = 5;
  map<string, string> tags = 6; // optional key/value exact matches
}

message ListSkillsResponse {
  repeated Skill skills = 1;
  string next_page_token = 2;
  uint32 result_count = 3;
  string generated_at = 4; // ISO8601 timestamp
}

message GetSkillRequest {
  oneof lookup {
    string slug = 1;
    string repo = 2; // e.g. "chatchat-space/Langchain-Chatchat"
  }
}

message StreamSkillEventsRequest {
  string cursor = 1;
  uint32 max_batch = 2;
}

message SkillEvent {
  enum Type {
    TYPE_UNSPECIFIED = 0;
    TYPE_UPSERT = 1;
    TYPE_DELETE = 2;
  }
  Type type = 1;
  string emitted_at = 2;
  Skill skill = 3;
  string sha256 = 4; // hash of canonical Skill JSON payload
}

message Skill {
  string id = 1; // stable UUID
  string slug = 2;
  string name = 3;
  string summary = 4;
  string description = 5;
  repeated string frameworks = 6;
  repeated string capabilities = 7;
  repeated string domains = 8;
  string repo_url = 9;
  string readme_url = 10;
  string homepage = 11;
  repeated Deployment deployments = 12;
  Pricing pricing = 13;
  Reputation reputation = 14;
  repeated Contact contacts = 15;
  License license = 16;
  map<string, string> metadata = 17;
  repeated Metric metrics = 18;
}

message Deployment {
  string docker_image = 1;
  string docker_digest = 2;
  string recommended_tag = 3;
  string helm_chart = 4;
  repeated Endpoint endpoints = 5;
}

message Endpoint {
  string type = 1; // e.g. "grpc", "http", "websocket"
  string url = 2;
  map<string, string> headers = 3;
}

message Pricing {
  string currency = 1; // ISO 4217
  double price_per_1k_tokens = 2;
  double price_per_minute = 3;
  double price_per_call = 4;
  string billing_url = 5;
}

message Reputation {
  double score = 1; // 0-1 normalized
  uint32 rating_count = 2;
  string source = 3; // e.g. "langchain.md"
  repeated string badges = 4;
}

message Contact {
  string type = 1; // "maintainer", "security", "support"
  string value = 2;
}

message License {
  string spdx_id = 1;
  string name = 2;
  string url = 3;
}

message Metric {
  string name = 1;
  double value = 2;
  string unit = 3;
  string collected_at = 4;
}

message Pagination {
  uint32 page_size = 1;
  string page_token = 2;
}
```

## Descriptor Hosting
1. Place the compiled protobuf schema at `/descriptor.proto` in the static site root.
2. Regenerate whenever fields change; bump `option version = "1"` at top-level to coordinate schema evolution.
3. Provide a SHA256 checksum at `/descriptor.sha256` so clients can cache/validate automated downloads.

## Backing Data
- `data/agents.json` is the source-of-truth; the gRPC handler should hydrate `Skill` messages from this JSON.
- The `tools/sync_agents.js` ingestion already fetches repo metadata; extend it to populate `deployments`, `pricing`, and `reputation` once those sources are available.

## Security & Auth
- Serve gRPC over QUIC with TLS 1.3.
- Require a short-lived Bearer token (`Authorization: Bearer <JWT>`). Issue tokens via GitHub OAuth or signed service accounts.
- Rate-limit anonymous access to 60 requests/minute.

## Versioning Strategy
- Semantic versions on the repo (tag `rpc/v1.x.y`).
- Proto package namespace increments (`directory.v2`) for breaking changes.
- Maintain at least two stable versions simultaneously during migration windows.

## Next Steps
1. Generate `descriptor.proto` from the schema above and publish it in the repository.
2. Implement a minimal gRPC server (Go, Node, or Rust) that reads `agents.json` and responds to `ListSkills`.
3. Schedule a cron to re-run `sync_agents.js` (GitHub Actions or Vercel Cron) and redeploy descriptor + data.
4. Align documentation (`LLM.txt`, `operations.md`) to tell agent builders to consume the RPC interface first.
