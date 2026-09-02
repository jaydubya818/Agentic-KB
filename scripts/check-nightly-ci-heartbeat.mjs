#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function evaluateHeartbeat(state, { now = new Date(), maxAgeHours = 36 } = {}) {
  const finishedAt = new Date(state?.finished_at)
  if (Number.isNaN(finishedAt.getTime())) {
    return {
      healthy: false,
      status: 'invalid',
      message: 'state/nightly-ci/last-run.json has no valid finished_at timestamp',
    }
  }

  const ageHours = (now.getTime() - finishedAt.getTime()) / 3_600_000
  const reportedStatus = String(state?.status || 'missing')
  const reasons = []

  if (ageHours < 0) reasons.push('finished_at is in the future')
  if (ageHours > maxAgeHours) reasons.push(`heartbeat is ${ageHours.toFixed(1)} hours old (limit ${maxAgeHours})`)
  if (reportedStatus !== 'ok') reasons.push(`latest run status is ${reportedStatus}`)

  return {
    healthy: reasons.length === 0,
    status: reasons.length === 0 ? 'ok' : 'degraded',
    reportedStatus,
    finishedAt: finishedAt.toISOString(),
    ageHours: Number(ageHours.toFixed(1)),
    message: reasons.length === 0
      ? `nightly CI heartbeat is healthy (${ageHours.toFixed(1)} hours old)`
      : reasons.join('; '),
  }
}

function parseArgs(argv) {
  const options = {
    statePath: path.join(REPO, 'state', 'nightly-ci', 'last-run.json'),
    maxAgeHours: 36,
    now: new Date(),
  }

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--state') options.statePath = path.resolve(argv[++i])
    else if (argv[i] === '--max-age-hours') options.maxAgeHours = Number(argv[++i])
    else if (argv[i] === '--now') options.now = new Date(argv[++i])
    else throw new Error(`Unknown argument: ${argv[i]}`)
  }

  if (!Number.isFinite(options.maxAgeHours) || options.maxAgeHours <= 0) {
    throw new Error('--max-age-hours must be a positive number')
  }
  if (Number.isNaN(options.now.getTime())) throw new Error('--now must be a valid timestamp')
  return options
}

function writeGitHubOutputs(result) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  const values = {
    status: result.status,
    reported_status: result.reportedStatus || 'invalid',
    finished_at: result.finishedAt || 'unknown',
    age_hours: result.ageHours ?? 'unknown',
    message: result.message.replace(/[\r\n]+/g, ' '),
  }
  fs.appendFileSync(output, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''))
}

function main() {
  const options = parseArgs(process.argv)
  const state = JSON.parse(fs.readFileSync(options.statePath, 'utf8'))
  const result = evaluateHeartbeat(state, options)
  writeGitHubOutputs(result)
  console.log(result.message)
  process.exit(result.healthy ? 0 : 2)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    const result = { status: 'invalid', message: error.message }
    writeGitHubOutputs(result)
    console.error(error.message)
    process.exit(1)
  }
}
