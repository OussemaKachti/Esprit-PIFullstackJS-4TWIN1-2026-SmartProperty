#!/bin/sh
set -e

cd /backoffice
npm run dev -- --host 0.0.0.0 --port 5173 &

nginx -g 'daemon off;'
