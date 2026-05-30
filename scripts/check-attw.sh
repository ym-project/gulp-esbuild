#!/usr/bin/env sh

# Verify the published type declarations resolve correctly across module
# resolution modes (ESM/CJS/node10/bundler) with @arethetypeswrong/cli.
set -eu

# Build fresh artifacts so attw checks the real output, not a stale dist
npm run build

# `--pack` makes attw run `npm pack` itself and clean up the tarball afterwards
npx --yes @arethetypeswrong/cli --pack .
