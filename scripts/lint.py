#!/usr/bin/env python3
"""
lint.py — Agentic-KB lint pass per CLAUDE.md LINT Workflow.

Scans wiki/ and emits a report covering:
  1. Orphan pages (no inbound links)
  2. Stale framework pages (last_checked > 60d)
  3. Untested recipes (tested: false, mtime > 30d)
  4. Unreviewed pages (reviewed: false, mtime > 30d)
  5. Review drift (reviewed: true but mtime > reviewed_date)
  6. Concept/synthesis pages missing `Counter-arguments & Gaps` section
  7. Low-confidence claims (confidence: low)
  8. Gap candidates: wiki-links that resolve to nothing

Output: wiki/syntheses/lint-{YYYY-MM-DD}.md
"""

from __future__ import annotations
import re
import sys
import datetime as dt
from pathlib import Path
from collections import defaultdict

VAULT = Path(__file__).resolve().parent.parent
WIKI = VAULT / "wiki"
TODAY = dt.date.today()

# ─── frontmatter ──────────────────────────────────────────────────────────────

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)

def parse_frontmatter(text: str) -> dict:
    m = FM_RE.match(text)
    if not m:
        return {}
    body = m.group(1)
    out = {}
    key = None
    for line in body.splitlines():
        if re.match(r"^\s*-\s", line):
            # list continuation
            if key:
                out.setdefault(key, [])
                if isinstance(out[key], list):
                    out[key].append(line.strip().lstrip("-").strip().strip('"').strip("'"))
            continue
        m2 = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$", line)
        if m2:
            key = m2.group(1)
            val = m2.group(2).strip()
            if val in ("", "[]"):
                out[key] = [] if val == "[]" else ""
            else:
                # strip quotes
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                out[key] = val
    return out

def parse_date(s) -> dt.date | None:
    if not s or not isinstance(s, str):
        return None
    try:
        return dt.date.fromisoformat(s[:10])
    except Exception:
        return None

# ─── link extraction ──────────────────────────────────────────────────────────

WIKILINK_RE = re.compile(r"\[\[([^\]\|#]+)(?:\|[^\]]+)?(?:#[^\]]+)?\]\]")

def extract_wikilinks(text: str) -> set[str]:
    links = set()
    for m in WIKILINK_RE.finditer(text):
        target = m.group(1).strip()
        # normalize: strip .md, leading wiki/
        target = target.removesuffix(".md")
        if target.startswith("wiki/"):
            target = target[5:]
        links.add(target)
    return links

def page_keys_for(path: Path) -> set[str]:
    """What link targets resolve to this page?"""
    rel = path.relative_to(WIKI).with_suffix("")  # e.g. concepts/agent-loops
    s = str(rel).replace("\\", "/")
    return {s, path.stem}

# ─── section detection ───────────────────────────────────────────────────────

def has_section(text: str, heading_pattern: str) -> bool:
    return bool(re.search(rf"^#+\s+{heading_pattern}\s*$", text, re.MULTILINE | re.IGNORECASE))

# ─── main scan ───────────────────────────────────────────────────────────────

def scan():
    pages = []
    inbound = defaultdict(set)

    md_files = sorted(p for p in WIKI.rglob("*.md") if p.is_file())
    all_keys = {}
    for p in md_files:
        for k in page_keys_for(p):
            all_keys[k] = p

    for p in md_files:
        text = p.read_text(encoding="utf-8", errors="replace")
        fm = parse_frontmatter(text)
        body = FM_RE.sub("", text, count=1)
        links = extract_wikilinks(text)
        mtime = dt.date.fromtimestamp(p.stat().st_mtime)
        pages.append({
            "path": p,
            "rel": str(p.relative_to(WIKI)),
            "fm": fm,
            "body": body,
            "text": text,
            "links": links,
            "mtime": mtime,
        })
        # resolve inbound
        for link in links:
            if link in all_keys:
                inbound[all_keys[link]].add(p)

    # ─── checks ───
    orphans = []
    stale_frameworks = []
    untested_recipes = []
    unreviewed_old = []
    review_drift = []
    missing_counter = []
    low_confidence = []
    unresolved_links = defaultdict(set)

    hub_files = {"index.md", "home.md", "hot.md", "log.md", "recently-added.md",
                 "lint-report.md", "schema.md", "stats.md"}

    for pg in pages:
        p = pg["path"]
        rel = pg["rel"]
        fm = pg["fm"]
        if p.name in hub_files or rel.startswith("mocs/"):
            continue  # hubs/MoCs exempt from orphan check
        if rel.startswith("daily-systems/") or rel.startswith("system/") or rel.startswith("agents/") or rel.startswith("repos/"):
            continue  # these have their own discovery paths
        if not inbound[p]:
            orphans.append(rel)

    for pg in pages:
        fm = pg["fm"]
        p = pg["path"]
        rel = pg["rel"]
        ptype = (fm.get("type") or "").lower()

        # stale framework
        if ptype == "framework":
            lc = parse_date(fm.get("last_checked"))
            if lc and (TODAY - lc).days > 60:
                stale_frameworks.append(f"{rel} (last_checked {lc}, {(TODAY - lc).days}d ago)")

        # untested recipes
        if ptype == "recipe":
            tested = str(fm.get("tested", "")).lower()
            if tested != "true" and (TODAY - pg["mtime"]).days > 30:
                untested_recipes.append(rel)

        # unreviewed
        reviewed = str(fm.get("reviewed", "")).lower()
        if reviewed in ("false", "") and (TODAY - pg["mtime"]).days > 30 and ptype in ("concept","pattern","framework","recipe","summary","synthesis","personal","evaluation"):
            unreviewed_old.append(f"{rel} (mtime {pg['mtime']})")

        # review drift
        if reviewed == "true":
            rd = parse_date(fm.get("reviewed_date"))
            if rd and pg["mtime"] > rd:
                review_drift.append(f"{rel} (reviewed {rd}, mtime {pg['mtime']})")

        # missing Counter-arguments section on concept/synthesis
        # Exempt: auto-generated lint reports, personal test notes
        if ptype in ("concept", "synthesis") and not rel.startswith("syntheses/lint-") and not rel.endswith("/private-test-note.md"):
            if not has_section(pg["body"], r"Counter-arguments.*"):
                missing_counter.append(rel)

        # low confidence
        conf = str(fm.get("confidence", "")).lower()
        if conf == "low":
            low_confidence.append(rel)

        # unresolved links
        for link in pg["links"]:
            if link in ("home", "index", "hot", "log"):
                continue
            # accept path-form matches
            if link in all_keys:
                continue
            # accept bare stem match
            if any(k.endswith("/" + link) for k in all_keys if "/" in k):
                continue
            # skip external refs (contain a dot, or start with http)
            if "." in link and not link.endswith("/"):
                continue
            unresolved_links[link].add(pg["rel"])

    return {
        "total_pages": len(pages),
        "orphans": orphans,
        "stale_frameworks": stale_frameworks,
        "untested_recipes": untested_recipes,
        "unreviewed_old": unreviewed_old,
        "review_drift": review_drift,
        "missing_counter": missing_counter,
        "low_confidence": low_confidence,
        "unresolved_links": unresolved_links,
    }

# ─── report ──────────────────────────────────────────────────────────────────

def report(r: dict) -> str:
    out = []
    out.append(f"---")
    out.append(f'title: "Lint Report — {TODAY}"')
    out.append(f"type: synthesis")
    out.append(f"sources: []")
    out.append(f'question: "What schema/link/review debt does the wiki carry as of {TODAY}?"')
    out.append(f"tags: [lint, maintenance]")
    out.append(f"created: {TODAY}")
    out.append(f"updated: {TODAY}")
    out.append(f"reviewed: false")
    out.append(f'reviewed_date: ""')
    out.append(f"---")
    out.append("")
    out.append(f"# Lint Report — {TODAY}")
    out.append("")
    out.append(f"**Scanned:** {r['total_pages']} wiki pages")
    out.append("")

    def section(title, items, empty_msg="Clean."):
        out.append(f"## {title} ({len(items)})")
        out.append("")
        if not items:
            out.append(empty_msg)
            out.append("")
            return
        for x in items:
            out.append(f"- `{x}`")
        out.append("")

    section("1. Orphan pages (no inbound links)", r["orphans"])
    section("2. Stale framework pages (last_checked > 60d)", r["stale_frameworks"])
    section("3. Untested recipes (>30d since mtime)", r["untested_recipes"])
    section("4. Unreviewed pages (>30d since mtime)", r["unreviewed_old"])
    section("5. Review drift (content changed after reviewed_date)", r["review_drift"])
    section("6. Concept/synthesis pages missing Counter-arguments section", r["missing_counter"])
    section("7. Low-confidence claims", r["low_confidence"])

    out.append(f"## 8. Unresolved wiki links ({len(r['unresolved_links'])})")
    out.append("")
    if not r["unresolved_links"]:
        out.append("Clean.")
    else:
        for link, sources in sorted(r["unresolved_links"].items()):
            src = ", ".join(sorted(sources)[:3])
            more = f" (+{len(sources)-3} more)" if len(sources) > 3 else ""
            out.append(f"- `[[{link}]]` — referenced in: {src}{more}")
    out.append("")

    out.append("## Question")
    out.append("")
    out.append(f"What schema/link/review debt does the wiki carry as of {TODAY}?")
    out.append("")
    out.append("## Argument")
    out.append("")
    total_debt = sum([
        len(r["orphans"]), len(r["stale_frameworks"]), len(r["untested_recipes"]),
        len(r["unreviewed_old"]), len(r["review_drift"]), len(r["missing_counter"]),
        len(r["unresolved_links"]),
    ])
    out.append(f"Total outstanding items across 8 checks: **{total_debt}**. The largest cohorts are the drivers.")
    out.append("")
    out.append("## Evidence")
    out.append("")
    out.append(f"- Orphans: {len(r['orphans'])}")
    out.append(f"- Stale frameworks: {len(r['stale_frameworks'])}")
    out.append(f"- Untested recipes: {len(r['untested_recipes'])}")
    out.append(f"- Unreviewed (>30d): {len(r['unreviewed_old'])}")
    out.append(f"- Review drift: {len(r['review_drift'])}")
    out.append(f"- Missing Counter-arguments: {len(r['missing_counter'])}")
    out.append(f"- Low confidence: {len(r['low_confidence'])}")
    out.append(f"- Unresolved links: {len(r['unresolved_links'])}")
    out.append("")
    out.append("## Counter-arguments & Gaps")
    out.append("")
    out.append("- **Not every orphan is bad.** Pages intentionally linked only from MoCs may appear as orphans if the MoC scan is too strict. Cross-check before fixing.")
    out.append("- **Reviewed-flag policy is new.** The `reviewed: false` backlog reflects schema adoption, not actual review debt — pages authored before Rule 12 have no `reviewed` field and default to unreviewed. This report conflates both; Jay may want to scope-limit to pages created after the schema-evolution commit.")
    out.append("- **Unresolved-link heuristic has false positives.** Links to page fragments (`#section`) and non-existent but intentional stubs are both flagged. Manual triage needed.")
    out.append("- **Counter-arguments-section check is literal.** Pages that cover opposing views under a different heading (e.g., 'Limitations', 'When NOT to Use') will be flagged as non-compliant even if the content is present.")
    out.append("")
    out.append("## Conclusion")
    out.append("")
    out.append("Work the largest cohort first. Re-run lint weekly during remediation to track burn-down.")
    out.append("")
    out.append("## Sources")
    out.append("")
    out.append("- Generated by `scripts/lint.py` against `CLAUDE.md` LINT Workflow steps 1–10.")
    out.append("")
    return "\n".join(out)

def main():
    r = scan()
    text = report(r)
    out_path = WIKI / "syntheses" / f"lint-{TODAY}.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8")
    print(f"Lint report → {out_path.relative_to(VAULT)}")
    print(f"  orphans: {len(r['orphans'])}")
    print(f"  stale_frameworks: {len(r['stale_frameworks'])}")
    print(f"  untested_recipes: {len(r['untested_recipes'])}")
    print(f"  unreviewed_old: {len(r['unreviewed_old'])}")
    print(f"  review_drift: {len(r['review_drift'])}")
    print(f"  missing_counter: {len(r['missing_counter'])}")
    print(f"  low_confidence: {len(r['low_confidence'])}")
    print(f"  unresolved_links: {len(r['unresolved_links'])}")

if __name__ == "__main__":
    main()
