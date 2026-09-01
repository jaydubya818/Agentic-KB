---
title: "The KB Runs Three Contradiction Protocols and Two of Them Disagree About Whether Losing Claims Survive"
type: synthesis
sources:
  - "[[system/policies/contradiction-policy]]"
  - "[[concepts/contradiction-handling-in-knowledge-bases]]"
  - "[[recipes/recipe-local-research-engine]]"
  - "[[patterns/wiki-ingest-workflow]]"
  - "[[summaries/summary-llm-wiki-v2]]"
question: "Three separate contradiction protocols govern this KB — the memory runtime's promotion-scorer policy, the wiki ingest concept, and the research engine's lens protocol. Are they one policy expressed three ways, or do they prescribe incompatible outcomes for the same conflict?"
tags: [memory, knowledge-base, safety, agentic, contradiction-handling, promotion, governance, advanced-techniques]
created: 2026-09-01
updated: 2026-09-01
reviewed: false
reviewed_date: ""
---

# The KB Runs Three Contradiction Protocols and Two of Them Disagree About Whether Losing Claims Survive

## Question

Three separate contradiction protocols govern this KB — [[system/policies/contradiction-policy]] (memory runtime), [[concepts/contradiction-handling-in-knowledge-bases]] (wiki ingest), and the research engine's `methodology/contradiction-protocol` reached via [[recipes/recipe-local-research-engine]]. Are they one policy expressed three ways, or do they prescribe incompatible outcomes for the same conflict?

## Argument

They are not one policy. The wiki-ingest concept and the research-engine protocol are the same philosophy under different names — preserve both positions, never force resolution, treat unresolved tension as a finding. The memory-runtime policy is a different philosophy: it scores the conflict, and under Tier 1 conditions it **demotes the losing page**. Those two stances cannot both be the KB's rule, because they produce opposite artifacts from the same input.

The concrete divergence is Tier 1 auto-resolution. `contradiction-policy.md` v2.1 fires when trust delta ≥ 0.20, the candidate has more independent sources, the conflicting page is `learned` or below, and the claim is factual. On a candidate win it sets `resolution = supersedes`, promotes the candidate, and **demotes the conflicting page to `learned`**. `contradiction-handling-in-knowledge-bases.md` says the opposite in its own words: "Do not overwrite — Both claims coexist until a human or deliberate editorial process resolves them," with an inline ⚠️ warning left in the page body and a `log.md` entry as the durable record. The research-engine protocol goes further still, instructing the agent to escalate to `open-questions.md` and treating "we don't know whether X or Y" as valuable intelligence in its own right.

The scoping arguments look reassuring and do not survive contact with the routing rules. One could say the runtime policy governs bus items and the concept governs wiki page edits — different objects, no conflict. But the runtime policy's own detection scope reads *wiki* surfaces: `wiki/hot.md` term matching, `wiki/index.md` same-subdirectory tag overlap, and slug-in-body matching against wiki pages. It resolves against the same pages the ingest concept says must never be overwritten. Both protocols claim authority over the same objects and prescribe different fates for them.

Worse, the pointer between them is broken in the direction that matters. `recipe-local-research-engine.md` states the research protocol "Maps to this KB's `contradiction-policy.md`" — mapping the preserve-both philosophy onto the auto-demote policy as if they agreed. Nothing in `contradiction-policy.md` points back, and `knowledge-systems/research-engine/methodology/contradiction-protocol` is a dangling wiki reference: the real file lives outside `wiki/` at `research-skill-graph/methodology/contradiction-protocol.md`, so it is invisible to lint, to the 2-click reachability rule, and to every query that anchors on `wiki/index.md`.

The practical consequence is a silent-loss surface. A factual claim — a version number, a date, a measurement, exactly the `claimType` set Tier 1 accepts — can be auto-superseded by an agent with a 0.20 trust edge, demoting a `learned` page whose only defence under the other two protocols would have been an inline ⚠️ block and a log line that a human eventually reads. The KB's stated value is that "the tension between sources is often the most intellectually valuable part." Tier 1 is the one code path that deletes tension rather than recording it.

## Evidence

| Protocol | Surface | Outcome on conflict | Human in loop |
|---|---|---|---|
| [[system/policies/contradiction-policy]] v2.1 | memory runtime / promotion scorer, `wiki/system/bus/review/` | Tier 1: candidate supersedes, conflicting page demoted to `learned`. Tier 2: routes to review | Only Tier 2; Tier 1 is post-hoc override within 7 days |
| [[concepts/contradiction-handling-in-knowledge-bases]] | wiki ingest, claim propagation step | Inline ⚠️ blockquote + `log.md` entry; both claims coexist; consider lowering `confidence` | Always |
| `research-skill-graph/methodology/contradiction-protocol` | research lenses | Document root cause and conditions; escalate to `open-questions.md`; unresolved is itself a finding | Always |

- `contradiction-policy.md`, Tier 1 auto-resolution: "**Candidate wins:** Set `resolution = supersedes`, promote candidate, demote conflicting page to `learned`."
- `contradiction-handling-in-knowledge-bases.md`, Protocol step 3: "**Do not overwrite** — Both claims coexist until a human or deliberate editorial process resolves them."
- `contradiction-policy.md` claims block already concedes its own thresholds are unvalidated: "trust_delta threshold of 0.20 is designed, not empirically validated. May be too permissive or too conservative," and "Penalty value is arbitrary — no empirical basis for 0.10 vs other values."
- `recipe-local-research-engine.md` §Step 2: the research protocol "Maps to this KB's `contradiction-policy.md`" — an asserted equivalence between the preserve-both and the auto-demote stances, with no reconciling page.

## Counter-arguments & Gaps

**The strongest counter-argument is that the objects really are different, and this synthesis is a category error.** Bus items are pre-canonical drafts; wiki pages are published knowledge. Demoting a `learned` bus item to keep the graph clean is housekeeping, not overwriting a published claim — and Tier 1 explicitly refuses to touch `canonical` pages. If that reading is correct, the two protocols are complementary layers, not rivals. This synthesis rests on the detection scope reading wiki surfaces, which proves the policy *reads* wiki pages, not that it *writes* to them.

**What the evidence does not show:** no observed Tier 1 auto-resolution. `wiki/log.md` contains no `[AUTO-RESOLVED]` entries that this synthesis located, so the divergence is documented-behaviour-versus-documented-behaviour, not a demonstrated data loss. It is possible `attemptAutoResolution` is specified but never wired into a live path — `contradiction-policy.md` names the implementation as `lib/agent-runtime/promotion-scorer.mjs`, which was not inspected here.

**Unresolved questions:**

1. Does `promotion-scorer.mjs` actually call `attemptAutoResolution`, and has it ever fired? A single grep of the runtime plus a scan of `wiki/log.md` for `[AUTO-RESOLVED]` would settle whether this is a live risk or a paper one.
2. Is "demote to `learned`" reversible? If the demoted page's content survives intact and only its memory class changes, the conflict with "do not overwrite" is mostly terminological.
3. Which protocol governs a contradiction surfaced by a *research lens* that lands in a wiki page — the research protocol that produced it, or the runtime policy that scores it on promotion? No routing rule exists.

**What would resolve it:** one owning page. Either `contradiction-policy.md` gains a scope clause explicitly disclaiming authority over published `wiki/` pages, or `contradiction-handling-in-knowledge-bases.md` gains a Tier 1 exception. A third option — an ADR declaring one protocol canonical and demoting the others to references — is cleaner but costs more.

## Conclusion

Two of the three protocols agree; the memory-runtime policy is the outlier, and its Tier 1 path is the only mechanism in the KB that resolves a contradiction by removing one side rather than recording both. Whether that is a live defect or a documentation artifact is unresolved and cheap to check — inspect `lib/agent-runtime/promotion-scorer.mjs` for a live call to `attemptAutoResolution` and grep `wiki/log.md` for `[AUTO-RESOLVED]`. Until then the honest position is: the KB has three contradiction protocols, one dangling cross-reference, and no page that says which one wins.

Immediate low-cost fix, independent of the above: repair the dangling `knowledge-systems/research-engine/methodology/contradiction-protocol` reference, since the research protocol currently sits outside `wiki/` and is invisible to lint and to the 2-click reachability rule.

## Sources

- [[system/policies/contradiction-policy]]
- [[concepts/contradiction-handling-in-knowledge-bases]]
- [[recipes/recipe-local-research-engine]]
- [[patterns/wiki-ingest-workflow]]
- [[summaries/summary-llm-wiki-v2]]
- [[mocs/memory]]
- [[mocs/advanced-techniques]]
