#!/usr/bin/env python3
"""
autolink.py — Obsidian wikilink autolinker

Inserts wikilinks for approved canonical entities from entity-map.json.
Protects frontmatter, code blocks, inline code, existing wikilinks, and
markdown links. Dry-run by default; pass --write to actually write files.

See docs/OBSIDIAN_GRAPH.md for usage.
"""
import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

FRONTMATTER_RE   = re.compile(r"^---\n.*?\n---\n?", re.DOTALL)
FENCED_CODE_RE   = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE   = re.compile(r"`[^`]+`")
WIKILINK_RE      = re.compile(r"\[\[[^\]]+\]\]")
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\([^\)]+\)")
HTML_COMMENT_RE  = re.compile(r"<!--.*?-->", re.DOTALL)


@dataclass
class Entry:
    canonical: str
    target: str
    aliases: List[str]
    case_sensitive: bool = False


def load_entity_map(path: Path) -> List[Entry]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return [
        Entry(
            canonical=canonical,
            target=config["target"],
            aliases=config.get("aliases", []),
            case_sensitive=config.get("case_sensitive", False),
        )
        for canonical, config in raw.items()
    ]


def protect_regions(text: str) -> Tuple[str, List[str]]:
    protected: List[str] = []
    for pattern in [FRONTMATTER_RE, FENCED_CODE_RE, INLINE_CODE_RE,
                    WIKILINK_RE, MARKDOWN_LINK_RE, HTML_COMMENT_RE]:
        def replacer(m, _p=protected):
            _p.append(m.group(0))
            return f"__PROTECTED_{len(_p)-1}__"
        text = pattern.sub(replacer, text)
    return text, protected


def restore_regions(text: str, protected: List[str]) -> str:
    for i, region in enumerate(protected):
        text = text.replace(f"__PROTECTED_{i}__", region)
    return text


def compile_patterns(entries: List[Entry]):
    compiled, seen = [], set()
    for entry in entries:
        for phrase in [entry.canonical] + entry.aliases:
            key = (phrase.lower(), entry.target)
            if key in seen:
                continue
            seen.add(key)
            flags = 0 if entry.case_sensitive else re.IGNORECASE
            pat = re.compile(
                rf"(?<!\[\[)(?<!\w){re.escape(phrase)}(?!\w)(?!\]\])", flags
            )
            compiled.append((pat, entry.target, phrase))
    compiled.sort(key=lambda x: len(x[2]), reverse=True)
    return compiled


def process_text(text: str, compiled_patterns, first_only: bool = False):
    protected_text, regions = protect_regions(text)
    changes = []
    for pattern, target, phrase in compiled_patterns:
        count = 1 if first_only else 0
        updated, n = pattern.subn(target, protected_text, count=count)
        if n:
            changes.append((phrase, n))
            protected_text = updated
    return restore_regions(protected_text, regions), changes


def should_skip(path: Path, skip_folders: List[str]) -> bool:
    s = str(path).replace("\\", "/")
    return any(
        f"/{f.strip('/')}/" in s or s.startswith(f.strip('/') + "/")
        for f in skip_folders
    )


def main():
    parser = argparse.ArgumentParser(description="Obsidian wikilink autolinker")
    parser.add_argument("--vault",       required=True)
    parser.add_argument("--entity-map",  required=True)
    parser.add_argument("--write",       action="store_true")
    parser.add_argument("--first-only",  action="store_true")
    parser.add_argument("--folder",      action="append", default=[])
    parser.add_argument("--skip-folder", action="append",
                        default=[".obsidian", "assets", ".git", "node_modules",
                                 "raw/webhooks", "wiki/lint-report.md"])
    parser.add_argument("--report",      default="autolink-report.md")
    args = parser.parse_args()

    vault      = Path(args.vault).expanduser().resolve()
    entity_map = Path(args.entity_map).expanduser().resolve()
    entries    = load_entity_map(entity_map)
    patterns   = compile_patterns(entries)

    report = [
        "# Autolink report", "",
        f"- Vault: `{vault}`",
        f"- Entity map: `{entity_map}`",
        f"- Mode: `{'WRITE' if args.write else 'DRY-RUN'}`",
        f"- First only: `{args.first_only}`", "",
        "## Changes", "",
    ]

    files_changed = total_replacements = 0
    for p in vault.rglob("*.md"):
        if not p.is_file():
            continue
        path_str = str(p)
        if args.folder and not any(f in path_str for f in args.folder):
            continue
        if should_skip(p, args.skip_folder):
            continue
        original = p.read_text(encoding="utf-8")
        updated, changes = process_text(original, patterns, first_only=args.first_only)
        if updated != original:
            files_changed += 1
            total_replacements += sum(n for _, n in changes)
            report.append(f"### {p.relative_to(vault)}")
            for phrase, n in changes:
                report.append(f"- `{phrase}` → {n} replacement(s)")
            report.append("")
            if args.write:
                p.write_text(updated, encoding="utf-8")

    report.insert(7, f"- Files changed: `{files_changed}`")
    report.insert(8, f"- Total replacements: `{total_replacements}`")
    report_path = Path(args.report).expanduser().resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report), encoding="utf-8")
    print(f"Done. {files_changed} files, {total_replacements} replacements.")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
