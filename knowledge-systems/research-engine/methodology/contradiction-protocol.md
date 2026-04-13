# Contradiction Protocol

What to do when sources or lenses disagree. Contradictions are features, not bugs — they're where real insights live.

*Maps to Agentic-KB `system/policies/contradiction-policy.md`*

---

## When Two Sources Disagree

### Step 1: Check the basics
- Are they talking about the same thing? (different geographies, time periods, definitions?)
- Are they using the same data? (same dataset, different interpretation?)
- Is one source a higher tier? (see [[methodology/source-evaluation]])

### Step 2: Find the root of disagreement
Usually one of:
- **Different data:** different datasets → find which is more complete/recent
- **Different interpretation:** same data, different conclusions → examine reasoning chain
- **Different scope:** one is global, one is country-specific → both can be right in their context
- **Different timeframe:** short-term vs long-term trends can look opposite (both true)
- **Different incentives:** one has reason to spin the data → check funding, affiliations

### Step 3: Document, don't force resolution
In `deep-dive.md`, write:
> "Source A argues [X] based on [data]. Source B argues [Y] based on [data]. The disagreement likely stems from [root cause]. Under conditions [C1], A is probably right. Under conditions [C2], B is probably right."

### Step 4: Escalate to open-questions if unresolvable
If after honest effort you can't determine who's right:
- **This IS a finding.** "We don't know whether X or Y" is valuable intelligence.
- Add to `open-questions.md` with: the specific evidence needed to resolve it, and who would have that evidence.
- This often becomes the most interesting part of the research.

---

## When Two Lenses Disagree

This is expected and healthy. Different lenses SHOULD produce tension.

**Healthy tension examples:**
- Technical: "The math is brutal — birth rates will lead to collapse"
- Contrarian: "Japan has had low fertility for 50 years and hasn't collapsed"
- Resolution: both are right in different timeframes; the question is velocity, not direction

**Confidence adjustment:**
- 2 lenses agree, 1 disagrees → investigate the disagreeing lens deeper; it might see something others miss
- All lenses agree → be suspicious; you might have confirmation bias; re-run [[lenses/contrarian]] harder
- No lenses agree → research question might be too broad; narrow scope in [[index]]

---

## Resolution Hierarchy
1. **Tier difference:** If one source is Tier 1 and another is Tier 3, prefer Tier 1. Not automatically correct — but the burden of proof lies with the lower-tier source.
2. **Recency:** More recent data for fast-moving topics; historical data for structural patterns.
3. **Sample size:** Prefer studies with larger, more representative samples.
4. **Replication:** Has the finding been replicated independently? One study = hypothesis; three studies = evidence.
5. **Undocumented:** Add to `open-questions.md` with explicit note on what would resolve it.

---

## The Insight Extraction Rule
The most valuable research output often comes from the tension itself, not from resolving it. When you find a genuine contradiction between well-sourced lenses, ask:
> "Under what conditions would BOTH of these be true simultaneously?"

That conditional is usually the insight no one else has written yet.
