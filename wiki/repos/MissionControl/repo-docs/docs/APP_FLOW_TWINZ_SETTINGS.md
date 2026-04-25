---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/APP_FLOW_TWINZ_SETTINGS.md
imported_at: "2026-04-25T16:02:21.254Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/APP_FLOW_TWINZ_SETTINGS.md"
---

# Twinz — Settings & Onboarding Flow (Obsidian + Local LLM)

**Style:** APP_FLOW-style paste-ready spec  
**Scope:** Connect Obsidian vault, enable local model, sync test, G2 emulator test  
**Storage:** Where each piece lives (env vs DB vs metrics)

---

## 1. Principles (safety / trust)

- **Obsidian:** Twinz never asks for “Obsidian credentials.” There are none in the vault-path model. It asks only for:
  - **Local:** vault path (or per-user setting in DB), or  
  - **Cloud:** “Connect local gateway” / “Upload vault snapshot.”
- **Local LLM (e.g. Qwen):** No auth. Twinz stores only **metadata** (model name, version, provider, last-seen, latency, confidence). No API keys, no model file paths, no raw prompts/responses in settings.

---

## 2. What’s stored where

| What | Where | Notes |
|------|--------|------|
| **Obsidian vault path** | **Option A:** `OBSIDIAN_VAULT_PATH` in `.env.local` (server). **Option B (recommended long-term):** per-user in DB. | No token. No OAuth. Just path. |
| **Vault sync state** | DB | Last sync run timestamp, file count, error log ref (or last error message). |
| **Local model enabled** | DB (per user/device) | `localModelEnabled` (bool). |
| **Local model identity** | DB | `localModelName`, `localModelVersion`, `localModelProvider` (`"iphone-runtime"` \| `"laptop-emulator"`). |
| **Local model last seen** | DB | `lastSeenLocalModelAt` (timestamp). |
| **Local inference metrics** | Metrics/events (not settings) | `latencyMs`, `intentConfidence`, `questionConfidence`, `entityHash` / `questionHash` (no raw text). |
| **Secrets** | N/A | None for Obsidian (vault path) or local LLM. |

---

## 3. Settings UI structure

Two main sections in **Settings** (or onboarding):

- **Knowledge Graph** — Obsidian vault + sync.
- **Local Runtime** — Local model on/off, model identity, source (iPhone / laptop emulator), last heartbeat, latency.

---

## 4. Knowledge Graph (Obsidian) — flows

### 4.1 Connect Obsidian vault (local)

**Entry:** Settings → “Knowledge Graph” → “Obsidian Vault”.

**State:**

- **Not configured:** Show “Connect vault” (path input or “Use server default” if `OBSIDIAN_VAULT_PATH` is set).
- **Configured:** Show status “Connected”, masked path (e.g. `/Users/…/Vault`), last sync time, counts.

**Flow:**

1. User enters vault path (or confirms server default).
2. Server validates path (readable directory, optional: contains `.obsidian` or allow custom).
3. Save: **env** (server default) or **DB** (per-user path).
4. UI shows “Connected” and “Last sync: never” until first sync.
5. Buttons: **Run sync now**, **View last errors**, **Test retrieval**.

No token, no OAuth, no “Obsidian login.”

### 4.2 Run sync now

**Trigger:** “Run sync now” in Knowledge Graph.

**Flow:**

1. Client calls sync API (e.g. “start sync” mutation/action).
2. Server (or cron) runs sync: scan vault path, parse notes, update internal store/index.
3. On completion: store in DB `lastSyncRunAt`, `lastSyncFileCount`, `lastSyncError` (optional).
4. UI updates: “Last sync: &lt;timestamp&gt;”, “Files: N”, and if errors “View last errors” enabled.

### 4.3 View last errors

**Trigger:** “View last errors” (only active when last sync had errors).

**Flow:**

1. Show last sync error message and/or log ref (from DB).
2. Optional: link to logs or support. No credentials or paths in error UI (mask if needed).

### 4.4 Test retrieval

**Trigger:** “Test retrieval (search/traverse/context-pack).”

**Flow:**

1. Client calls “test retrieval” API (e.g. search + small traverse or context-pack build).
2. Server runs against configured vault (path from env or user DB).
3. Return: success/failure, sample result count or snippet (safe, no PII).
4. UI: “Retrieval OK” or “Retrieval failed: &lt;short reason&gt;.”

---

## 5. Local Runtime (local LLM) — flows

### 5.1 Enable local model

**Entry:** Settings → “Local Runtime”.

**State:**

- **Off:** Show “Local model: Off”, model name (read-only, e.g. Qwen3.5-0.8B), “Turn on” CTA.
- **On:** Show “Local model: On”, model name, provider (iPhone / laptop emulator), last heartbeat, avg inference latency.

**Flow (enable):**

1. User toggles “Local model” On.
2. Save to DB: `localModelEnabled = true` (and optionally default `localModelName` / `localModelProvider` if not yet set).
3. No “auth” step. Actual model runs on device/emulator; Twinz only records that the user enabled it and then receives **LocalAssistPacket** from gateway/emulator.

**Flow (disable):**

1. User toggles Off.
2. Save: `localModelEnabled = false`. Optionally clear `lastSeenLocalModelAt` or leave for history.

### 5.2 Where the model runs (no “grab” from Twinz)

- **Option 1 (recommended):** iPhone runtime owns the model; it sends `LocalAssistPacket` to Twinz gateway. Twinz stores metadata only (model name/version, `latencyMs`, confidence, hashes).
- **Option 2:** Laptop emulator owns the model; same packet interface. Twinz stores same metadata.

Twinz never “grabs” the model from Obsidian or cloud; it only receives packets and stores metadata + metrics.

### 5.3 Run G2 emulator test

**Trigger:** “Run G2 emulator test” (or “Test local runtime”) in Local Runtime section.

**Flow:**

1. User clicks “Run G2 emulator test.”
2. Client triggers test (e.g. call to backend that expects one or more LocalAssistPackets from emulator, or backend pings emulator endpoint).
3. Emulator runs local model, sends packet(s) to Twinz.
4. Twinz records: `lastSeenLocalModelAt`, and optionally a test result (success/failure, latency).
5. UI shows: “Last test: &lt;timestamp&gt;”, “Status: OK” or “Status: Failed”, “Avg latency: N ms.”

This validates: local runtime is on, model responds, and Twinz can receive and store metadata.

---

## 6. Onboarding (optional)

If onboarding is used, same flows can be offered as steps:

1. **Connect Obsidian vault** — path input or “Skip / configure later.”
2. **Enable local model** — On/Off + “Run G2 emulator test” to verify.
3. **Run sync test** — “Run sync now” + “Test retrieval” to verify Knowledge Graph.

Order can be: Vault → Sync test → Local model → Emulator test (or combine into one “Settings” entry point post-onboarding).

---

## 7. Stored data summary (quick ref)

| Data | Storage | Used by |
|------|--------|---------|
| Vault path | Env or DB (per user) | Sync, retrieval, test retrieval |
| Last sync time, file count, errors | DB | Knowledge Graph UI, “View last errors” |
| `localModelEnabled` | DB | Local Runtime UI, feature flags |
| `localModelName`, `localModelVersion`, `localModelProvider` | DB | Local Runtime UI, diagnostics |
| `lastSeenLocalModelAt` | DB | “Last heartbeat”, “Run G2 emulator test” result |
| `latencyMs`, confidence scores, hashes | Metrics/events | Analytics, no secrets |

---

## 8. Modal / screen inventory (Settings)

| Screen / Section | Content |
|------------------|--------|
| Settings → Knowledge Graph | Vault path (masked), Connected / Not configured, Last sync, Run sync now, View last errors, Test retrieval |
| Settings → Local Runtime | Local model On/Off, Model name (read-only in v1), Source (iPhone / laptop emulator), Last heartbeat, Avg latency, Run G2 emulator test |

---

*Paste-ready for APP_FLOW or Twinz product spec. Env vs DB vs metrics are explicit; no Obsidian credentials; local LLM is metadata-only.*
