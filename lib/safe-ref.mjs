// Validator for git revision strings supplied by untrusted callers.
// Used by the diff API to reject anything that could resolve to a shell
// metacharacter even though execFileSync is shell-free (defense in depth).
//
// Allowed: A-Z a-z 0-9 _ . / ~ ^ @ - { }
// Length:  1..200
//
// Covers HEAD, HEAD~1, HEAD^, refs/heads/x, branch/sub-branch, full sha,
// abbreviated sha, dated tags like v1.2.3, the standard git ancestor
// modifiers ~, ^, @, and reflog selectors like HEAD@{1}.
//
// Path-traversal sequences (../) pass this filter intentionally — they are
// not shell metacharacters, and git itself resolves them as nonsense refs
// and errors out. The validator's job is to block shell injection only.
export const SAFE_REF = /^[A-Za-z0-9_./~^@{}-]{1,200}$/

export function isSafeRef(ref) {
  return typeof ref === 'string' && SAFE_REF.test(ref)
}
