#!/usr/bin/env node
/**
 * pin.mjs — PIN-protected private layer for Agentic-KB
 *
 * Purpose
 *   Keep PII out of public GitHub commits while still letting it sync across
 *   machines as encrypted .enc files. Plaintext files in wiki/_private/*.md
 *   are gitignored. Encrypted blobs in wiki/_private/.enc/*.enc are committable.
 *
 * Subcommands
 *   pin init             create wiki/_private/ + sample stubs; install gitignore
 *   pin status           show lock state, file counts, age of locked vs plaintext
 *   pin lock [PIN]       encrypt all wiki/_private/*.md → wiki/_private/.enc/*.enc
 *                        and DELETE plaintext (use --keep to keep plaintext)
 *   pin unlock [PIN]     decrypt all wiki/_private/.enc/*.enc → wiki/_private/*.md
 *                        (does NOT delete .enc — plaintext can be re-locked)
 *   pin read NAME [PIN]  decrypt a single file to stdout (does not write plaintext)
 *
 * Crypto
 *   AES-256-GCM (authenticated)
 *   Key derivation: PBKDF2 100k iterations, SHA-256, 16-byte random salt per file
 *   12-byte random IV per file
 *   Format on disk:
 *     bytes  0..3   magic "PIN\1"
 *     bytes  4..19  salt (16)
 *     bytes 20..31  iv (12)
 *     bytes 32..47  authTag (16)
 *     bytes 48..    ciphertext
 *
 * Security caveats
 *   - PIN is the only secret. If your PIN is "1234" anyone with the .enc files
 *     can brute-force it in seconds. Pick a PIN you'd pick for a password manager.
 *   - This is meant to keep PII off public GitHub, not protect from a state actor.
 *   - PIN is read from argv if provided, otherwise prompted (no echo, terminal only).
 *   - No PIN is ever persisted to disk. If you lose it, your .enc files are gone.
 *
 * Usage
 *   node scripts/pin.mjs init
 *   node scripts/pin.mjs status
 *   node scripts/pin.mjs lock
 *   node scripts/pin.mjs unlock
 *   node scripts/pin.mjs read stuck-on
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync, existsSync, appendFileSync } from "node:fs";
import { resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PRIVATE_DIR = resolve(REPO_ROOT, "wiki/_private");
const ENC_DIR = resolve(PRIVATE_DIR, ".enc");
const GITIGNORE = resolve(REPO_ROOT, ".gitignore");

const MAGIC = Buffer.from("PIN\x01", "binary");
const PBKDF2_ITER = 100_000;
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

// ─── PIN input ──────────────────────────────────────────────────────────────

async function readPinFromTerminal(promptText) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    // Mute echo for PIN entry on TTYs (best-effort).
    const stdin = process.stdin;
    if (stdin.isTTY) {
      stdin.setRawMode?.(true);
      process.stdout.write(promptText);
      let pin = "";
      stdin.on("data", (b) => {
        const ch = b.toString("utf8");
        if (ch === "\r" || ch === "\n" || ch === "") {
          stdin.setRawMode?.(false);
          process.stdout.write("\n");
          rl.close();
          res(pin);
        } else if (ch === "") {
          // Ctrl-C
          process.exit(130);
        } else if (ch === "") {
          if (pin.length) pin = pin.slice(0, -1);
        } else {
          pin += ch;
        }
      });
    } else {
      rl.question(promptText, (answer) => {
        rl.close();
        res(answer);
      });
    }
  });
}

async function getPin(argvPin, action) {
  if (argvPin) return argvPin;
  const envPin = process.env.AGENTIC_KB_PIN;
  if (envPin) return envPin;
  return await readPinFromTerminal(`PIN to ${action}: `);
}

// ─── Crypto ─────────────────────────────────────────────────────────────────

function deriveKey(pin, salt) {
  return pbkdf2Sync(pin, salt, PBKDF2_ITER, KEY_LEN, "sha256");
}

function encryptFile(pin, plaintext) {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(pin, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, salt, iv, tag, ct]);
}

function decryptFile(pin, blob) {
  if (blob.subarray(0, 4).compare(MAGIC) !== 0) {
    throw new Error("not a pin-encrypted blob (bad magic)");
  }
  const salt = blob.subarray(4, 4 + SALT_LEN);
  const iv = blob.subarray(4 + SALT_LEN, 4 + SALT_LEN + IV_LEN);
  const tag = blob.subarray(4 + SALT_LEN + IV_LEN, 4 + SALT_LEN + IV_LEN + TAG_LEN);
  const ct = blob.subarray(4 + SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(pin, salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("decrypt failed — wrong PIN or corrupted blob");
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureDirs() {
  mkdirSync(PRIVATE_DIR, { recursive: true });
  mkdirSync(ENC_DIR, { recursive: true });
}

function listPlaintext() {
  if (!existsSync(PRIVATE_DIR)) return [];
  return readdirSync(PRIVATE_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => resolve(PRIVATE_DIR, f));
}

function listEncrypted() {
  if (!existsSync(ENC_DIR)) return [];
  return readdirSync(ENC_DIR)
    .filter((f) => f.endsWith(".enc"))
    .map((f) => resolve(ENC_DIR, f));
}

function ensureGitignore() {
  const required = [
    "# PIN-protected private layer — plaintext stays local; .enc blobs may commit",
    "wiki/_private/*",
    "!wiki/_private/.enc/",
    "!wiki/_private/.enc/**",
  ];
  let content = "";
  if (existsSync(GITIGNORE)) content = readFileSync(GITIGNORE, "utf8");
  if (content.includes("wiki/_private/*") && content.includes("!wiki/_private/.enc/")) {
    return false;
  }
  const block = "\n" + required.join("\n") + "\n";
  appendFileSync(GITIGNORE, block);
  return true;
}

// ─── Subcommands ────────────────────────────────────────────────────────────

function cmdInit() {
  ensureDirs();
  const added = ensureGitignore();
  const samples = {
    "stuck-on.md": `# Stuck on (private)

> This file is gitignored. Encrypted copy in wiki/_private/.enc/stuck-on.md.enc is committable.

_(your active blocker — e.g. interview cycles, comp negotiations, sensitive context)_
`,
    "next-milestone.md": `# Next milestone (private)

> This file is gitignored. Encrypted copy in wiki/_private/.enc/next-milestone.md.enc is committable.

_(what done looks like for the current sprint)_
`,
  };
  let created = 0;
  for (const [name, body] of Object.entries(samples)) {
    const p = resolve(PRIVATE_DIR, name);
    if (!existsSync(p)) {
      writeFileSync(p, body);
      created++;
    }
  }
  console.log(`pin: init OK`);
  console.log(`  wiki/_private/ : ${existsSync(PRIVATE_DIR) ? "exists" : "MISSING"}`);
  console.log(`  wiki/_private/.enc/ : ${existsSync(ENC_DIR) ? "exists" : "MISSING"}`);
  console.log(`  .gitignore     : ${added ? "updated" : "already configured"}`);
  console.log(`  sample files   : ${created} created`);
  console.log();
  console.log(`Next: edit wiki/_private/*.md with your real content, then`);
  console.log(`      node scripts/pin.mjs lock`);
}

function cmdStatus() {
  ensureDirs();
  const plain = listPlaintext();
  const enc = listEncrypted();
  console.log(`pin: status`);
  console.log(`  plaintext files: ${plain.length}`);
  plain.forEach((p) => {
    const s = statSync(p);
    console.log(`    ${basename(p)} (${s.size} bytes, modified ${s.mtime.toISOString()})`);
  });
  console.log(`  encrypted files: ${enc.length}`);
  enc.forEach((p) => {
    const s = statSync(p);
    console.log(`    ${basename(p)} (${s.size} bytes, modified ${s.mtime.toISOString()})`);
  });
  // detect drift: plaintext newer than corresponding .enc
  const driftedFiles = plain.filter((p) => {
    const encPath = resolve(ENC_DIR, basename(p) + ".enc");
    if (!existsSync(encPath)) return true; // never locked
    return statSync(p).mtime > statSync(encPath).mtime;
  });
  if (driftedFiles.length) {
    console.log();
    console.log(`  ⚠ ${driftedFiles.length} file(s) modified since last lock — run \`pin lock\``);
  } else if (plain.length === 0 && enc.length > 0) {
    console.log();
    console.log(`  📦 locked state — run \`pin unlock\` to decrypt for editing`);
  } else if (plain.length > 0 && enc.length === 0) {
    console.log();
    console.log(`  ⚠ plaintext exists but never locked — run \`pin lock\` to encrypt`);
  } else {
    console.log();
    console.log(`  ✓ in sync`);
  }
}

async function cmdLock(argvPin, opts = {}) {
  const plain = listPlaintext();
  if (plain.length === 0) {
    console.log("pin: nothing to lock (no plaintext in wiki/_private/)");
    return;
  }
  const pin = await getPin(argvPin, "lock");
  if (pin.length < 4) throw new Error("PIN must be at least 4 chars");
  ensureDirs();
  for (const p of plain) {
    const body = readFileSync(p, "utf8");
    const blob = encryptFile(pin, body);
    const encPath = resolve(ENC_DIR, basename(p) + ".enc");
    writeFileSync(encPath, blob);
    console.log(`  ${basename(p)} → ${basename(encPath)}`);
    if (!opts.keep) unlinkSync(p);
  }
  console.log(`pin: locked ${plain.length} file(s)${opts.keep ? " (kept plaintext)" : " (plaintext removed)"}`);
  console.log(`     commit the .enc files; they are safe to push.`);
}

async function cmdUnlock(argvPin) {
  const enc = listEncrypted();
  if (enc.length === 0) {
    console.log("pin: nothing to unlock (no .enc files)");
    return;
  }
  const pin = await getPin(argvPin, "unlock");
  ensureDirs();
  for (const e of enc) {
    const blob = readFileSync(e);
    const plaintext = decryptFile(pin, blob);
    const name = basename(e).replace(/\.enc$/, "");
    const out = resolve(PRIVATE_DIR, name);
    writeFileSync(out, plaintext);
    console.log(`  ${basename(e)} → ${name}`);
  }
  console.log(`pin: unlocked ${enc.length} file(s) into wiki/_private/`);
}

async function cmdRead(name, argvPin) {
  if (!name) throw new Error("usage: pin read <name>");
  const target = name.endsWith(".md") ? name : `${name}.md`;
  const encPath = resolve(ENC_DIR, `${target}.enc`);
  if (!existsSync(encPath)) throw new Error(`no encrypted file at ${encPath}`);
  const pin = await getPin(argvPin, "read");
  const plaintext = decryptFile(pin, readFileSync(encPath));
  process.stdout.write(plaintext);
}

// ─── CLI ────────────────────────────────────────────────────────────────────

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = new Set(rest.filter((a) => a.startsWith("--")));
  const args = rest.filter((a) => !a.startsWith("--"));
  switch (cmd) {
    case "init":
      cmdInit();
      break;
    case "status":
      cmdStatus();
      break;
    case "lock":
      await cmdLock(args[0], { keep: flags.has("--keep") });
      break;
    case "unlock":
      await cmdUnlock(args[0]);
      break;
    case "read":
      await cmdRead(args[0], args[1]);
      break;
    case "help":
    case "--help":
    case undefined:
      console.log(`pin.mjs — PIN-protected private layer for Agentic-KB

Usage:
  node scripts/pin.mjs init             — create wiki/_private/ + sample stubs
  node scripts/pin.mjs status           — show lock state
  node scripts/pin.mjs lock [PIN]       — encrypt *.md → .enc/*.enc, remove plaintext
                                          (--keep to retain plaintext alongside .enc)
  node scripts/pin.mjs unlock [PIN]     — decrypt .enc/*.enc → *.md
  node scripts/pin.mjs read NAME [PIN]  — decrypt one file to stdout
  node scripts/pin.mjs help             — this help

PIN is read from argv, $AGENTIC_KB_PIN, or interactive prompt (no echo).
Wiki/_private/*.md is gitignored; wiki/_private/.enc/*.enc is committable.
`);
      break;
    default:
      console.error(`unknown command: ${cmd}`);
      process.exit(2);
  }
}

main().catch((e) => {
  console.error(`pin: ${e.message}`);
  process.exit(1);
});
