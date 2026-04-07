---
title: Worktree Isolation
type: pattern
category: safety
problem: Risky agent operations (refactors, experiments) can corrupt the main codebase
solution: Run agent in a git worktree — isolated copy; merge only on success
tradeoffs:
  - "Full codebase isolation vs disk space for worktree copy"
  - "Clean merge/discard on completion vs git merge conflicts if main diverges"
  - "Enables bypassPermissions safely vs worktree setup/teardown overhead"
tags: [safety, isolation, git, worktree, sandbox, bypassPermissions]
confidence: high
sources:
  - "Git worktree documentation"
  - "Anthropic: Claude Code isolation mode"
  - "Superpowers: using-git-worktrees skill"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

Agents operating directly on the main codebase have no rollback boundary below `git reset`. If an autonomous agent (especially one running with bypassPermissions) makes bad decisions:
- Modified files may be partially edited (syntactically broken)
- Multiple files may be inconsistently changed
- Tests may be deleted or broken
- Configuration may be corrupted

`git reset --hard` recovers file contents but doesn't help if the agent made many changes that partially succeeded. You need a stronger isolation boundary: changes either succeed as a unit and get merged, or they're discarded entirely.

---

## Solution

Before starting risky agent work, create a git worktree — a second working directory linked to the same repository but checked out on a separate branch. The agent operates in the worktree. On success, merge the worktree branch into main. On failure, delete the worktree and branch — nothing touched main.

```
main codebase (untouched) ← agent never touches this
/tmp/agent-workspace/      ← agent operates here exclusively
    ↓ success → git merge → main updated
    ↓ failure → rm worktree → main unchanged
```

---

## Implementation Sketch

### Setting Up a Worktree

```bash
# Create a new branch and check it out in a worktree simultaneously
git worktree add /tmp/agent-workspace feature/agent-refactor

# Verify
git worktree list
# Outputs:
# /Users/jaywest/projects/my-app      abc1234 [main]
# /tmp/agent-workspace                abc1234 [feature/agent-refactor]
```

The worktree shares the git history and object store with the main repo — it's not a clone, so it's fast to create and uses minimal additional disk space (only the working directory files, not git objects).

### Automated Worktree Setup for Agent Sessions

```python
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

def create_agent_worktree(
    repo_path: str,
    task_name: str,
    base_branch: str = "main"
) -> AgentWorktree:
    """Create an isolated worktree for agent execution."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    branch_name = f"agent/{task_name.lower().replace(' ', '-')}/{timestamp}"
    worktree_path = f"/tmp/agent-{timestamp}"

    # Create the worktree on a new branch
    subprocess.run([
        "git", "worktree", "add",
        "-b", branch_name,
        worktree_path,
        base_branch
    ], cwd=repo_path, check=True)

    return AgentWorktree(
        worktree_path=worktree_path,
        branch_name=branch_name,
        base_branch=base_branch,
        repo_path=repo_path,
    )

@dataclass
class AgentWorktree:
    worktree_path: str
    branch_name: str
    base_branch: str
    repo_path: str

    def review_diff(self) -> str:
        """Show what the agent changed."""
        result = subprocess.run(
            ["git", "diff", f"{self.base_branch}...{self.branch_name}"],
            capture_output=True, text=True
        )
        return result.stdout

    def merge_to_main(self, squash: bool = True) -> bool:
        """Merge agent changes into the base branch."""
        merge_cmd = ["git", "merge", "--squash" if squash else "--no-ff", self.branch_name]
        result = subprocess.run(merge_cmd, cwd=self.repo_path)
        return result.returncode == 0

    def discard(self):
        """Discard all agent changes. Main codebase is unaffected."""
        subprocess.run(["git", "worktree", "remove", "--force", self.worktree_path])
        subprocess.run(["git", "branch", "-D", self.branch_name], cwd=self.repo_path)
```

### Running the Agent in the Worktree

```python
async def run_agent_isolated(task: str, task_name: str, repo_path: str) -> AgentResult:
    worktree = create_agent_worktree(repo_path, task_name)

    try:
        # Run agent with worktree as working directory
        # The agent sees the codebase but all writes go to the worktree
        result = await run_agent(
            task=task,
            working_directory=worktree.worktree_path,
            # Allow autonomous operation since changes are isolated
            permission_mode="bypassPermissions",
        )

        if result.success:
            # Show diff before merging
            diff = worktree.review_diff()
            print(f"Agent changes:\n{diff}")

            # Human review before merge (optional but recommended)
            if await request_merge_approval(diff):
                merged = worktree.merge_to_main()
                return AgentResult(success=merged, changes_merged=merged)
            else:
                worktree.discard()
                return AgentResult(success=False, reason="merge_rejected")
        else:
            worktree.discard()
            return AgentResult(success=False, reason=result.error)

    except Exception as e:
        worktree.discard()
        raise
    finally:
        # Always clean up the worktree (even if merge was successful)
        try:
            subprocess.run(["git", "worktree", "prune"], cwd=repo_path)
        except:
            pass
```

### Integration with Claude Code's Isolation Mode

In the Superpowers framework, the `using-git-worktrees` skill formalizes this:

```bash
# Claude Code running in isolation mode:
# 1. Claude Code creates the worktree automatically
# 2. Agent executes with bypassPermissions in the worktree
# 3. Session ends with a diff summary
# 4. User reviews and decides to merge or discard

claude --isolation=worktree --dangerously-skip-permissions "Refactor auth module"
```

---

## When to Use

**Non-negotiable**: Any time you use `bypassPermissions` on a task that writes to files. Without a worktree, bypassPermissions is reckless. With a worktree, it's safe — the worst case is discarding the worktree.

**Recommended**:
- Large refactors touching many files
- Experimental changes with uncertain outcome
- First time running a new autonomous agent on a codebase
- Any agent task where "undo" via `git reset` would be complex

### Risk Matrix

| Agent Type | File Access | Recommended Isolation |
|-----------|-------------|----------------------|
| Default mode (prompts) | Main codebase | Acceptable |
| acceptEdits (no prompts) | Main codebase | Acceptable if watching |
| bypassPermissions | Main codebase | Not recommended |
| bypassPermissions | Git worktree | Recommended |
| Multi-agent autonomous | Git worktree | Required |

---

## Cleanup After Failure

```bash
# List all worktrees (find orphaned ones)
git worktree list

# Remove a specific worktree
git worktree remove /tmp/agent-20260404_103045

# Remove orphaned worktrees (when directory was already deleted)
git worktree prune

# Delete the associated branch
git branch -D agent/my-task/20260404_103045
```

Automate cleanup after each session — orphaned worktrees accumulate.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Full isolation | Agent mistakes can't touch main | Disk space for full working directory |
| Clean rollback | Discard = entire workspace gone | Git merge conflicts if main advances during long agent runs |
| Enables autonomy | bypassPermissions is safe with worktrees | Setup/teardown overhead per session |
| Diff review | Easy to review exactly what changed | Merge squash loses commit history granularity |

---

## When NOT To Use

- Short read-only tasks (no writes = no isolation needed)
- Tasks that depend on recent changes not yet committed to base branch (worktree starts from base branch)
- Environments without git (legacy codebases, monorepo setups with non-git VCS)

---

## Real Examples

- Superpowers `using-git-worktrees` skill for risky changes
- GSD autonomous mode with `--isolation: worktree` flag
- CI/CD pipeline: each PR gets a worktree for automated review agent
- Nightly refactoring agents: worktrees created/merged/discarded autonomously

---

## Related Patterns

- [[concepts/permission-modes]] — bypassPermissions + worktree is the recommended autonomous combo
- [[patterns/pattern-minimal-permissions]] — scope tools within the worktree too
- [[patterns/pattern-confirm-before-destructive]] — review diff before merging is a confirmation gate

---

## Sources

- Git worktree documentation (`man git-worktree`)
- Anthropic Claude Code isolation mode documentation
- Superpowers `using-git-worktrees` skill
