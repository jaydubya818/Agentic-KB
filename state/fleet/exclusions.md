# Fleet exclusion ledger (every repo not receiving autonomous changes, with reason)
Updated 2026-10-11. Review daily; entries need a reason and an owner.

| Repo | Scope of exclusion | Reason |
|---|---|---|
| myeve-alpha-workspace-01, myeve-alpha-workspace-02 | all changes | open "disable" PRs; workspace clones |
| flatratepa-staging-scheduler | all but docs | content is workflows-only; no workflow scope |
| MissionControl, MissionControlEnterprise, SellerFi, relay | direct commits, merges | branch protection / "humans merge PRs" governance: PR-only |
| forks, archived repos | all | out of scope until reviewed individually |
| Any repo with open security advisory | non-security changes | skip until advisory handled (Tier D owns it) |
| Any `.github/workflows/**` path | all but nightly-ci-analysis Tier A | no `workflow` scope on job tokens |
