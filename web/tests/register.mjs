// Entry point for `node --import ./tests/register.mjs --test`.
import { register } from 'node:module'
register('./ts-hooks.mjs', import.meta.url)
