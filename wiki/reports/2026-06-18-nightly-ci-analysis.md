# Nightly CI Analysis — 2026-06-18

**Window:** last 24 hours (2026-06-17 ~10:34 UTC → 2026-06-18 ~10:34 UTC)

## Summary

| Repo | Runs | Passed | Failed | In Progress |
|------|------|--------|--------|-------------|
| sellerfi | 1 | 0 | 1 | 0 |
| missioncontrol | 0 | — | — | — |
| twinz | 0 | — | — | — |
| **Total** | **1** | **0** | **1** | **0** |

---

## Failures

### ❌ sellerfi — `main` — Vercel Environment Check

**Run ID:** 27753546220 (2026-06-18T10:33:47Z)

**Root cause:** Expired/revoked `VERCEL_TOKEN` secret.

The workflow calls the Vercel REST API (`GET /v9/projects/{id}/env`) using `secrets.VERCEL_TOKEN`. The API returned HTTP 403:

```
❌ Vercel API request failed with HTTP 403
{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}
```

This is a credential issue, not a code or workflow YAML bug. The token in GitHub Actions secrets is no longer valid.

**Recurrence:** This failure has occurred every single day for at least 10 consecutive days (June 9 – June 18). It is a chronic, unresolved issue.

**Blocking a PR?** No. This is a scheduled daily check on `main`; no open PRs are affected.

**Action taken:** ⚠️ **Report-only** — cannot fix via code commit. Requires secret rotation.

**Suggested fix (manual — Jay must do this):**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) and generate a new token.
2. Update `VERCEL_TOKEN` in GitHub Actions secrets: `Settings > Secrets and variables > Actions > VERCEL_TOKEN`.
3. Optionally trigger the workflow manually to confirm: `gh workflow run vercel-env-check.yml --repo jaydubya818/sellerfi`.

---

## Commits / PRs Created This Run

None. The only failure requires secret rotation, which cannot be committed as code.

---

## missioncontrol

No runs in the last 24 hours. Last run: 2026-06-11 ✅ (passed).

## twinz

No runs in the last 24 hours. Last run: 2026-05-30 ✅ (passed). (Note: `Auto Version Bump` has recurring failures on `master` from late May, but nothing in the 24h window.)
