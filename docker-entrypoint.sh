#!/bin/bash

set -e

: "${REMIX_HOST:=net-doc-remix}"
: "${REMIX_PORT:=3000}"

function prepare_database {
  npm uninstall bcrypt
  npm install bcrypt

  npx prisma migrate deploy
  npx prisma generate --sql
}

if [ "$1" = 'net-doc-remix' ]; then
  prepare_database

  npm run start:remix

elif [ "$1" = 'net-doc-worker' ]; then
  prepare_database

  npm run start:worker
elif [ "$1" = 'net-doc-nginx' ]; then
  # configure nginx
  sed -e "s#server .*:3000#server ${REMIX_HOST}:${REMIX_PORT}#g" \
      -e 's#/var/log/nginx/net-doc.\(access\|error\).log#/dev/stdout#g' < /app/docker/nginx.conf > /etc/nginx/sites-enabled/default

  echo "starting nginx..."

  exec /usr/sbin/nginx -g 'daemon off;'
fi