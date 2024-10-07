#!/usr/bin/env bash

set -e

function prepare_database {
  npx prisma migrate deploy
  npx prisma generate --sql
}

if [ "$1" = 'net-doc-remix' ]; then
  prepare_database

  npm run start:remix

elif [ "$1" = 'net-doc-worker' ]; then
  prepare_database

  npm run start:worker
fi