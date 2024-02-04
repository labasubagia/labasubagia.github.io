#!/bin/sh

pnpm install

if [[ "${CODESPACES}" == true ]]; then
  echo "Fixing directory ownership for GitHub Codespaces..." >&2
  sudo chown -R node:node /home/node
  sudo chown -R node:node /workspace
fi
