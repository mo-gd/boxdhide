#!/bin/sh
# Builds the Chrome Web Store upload: dist/boxdhide-<version>.zip
set -eu
cd "$(dirname "$0")/.."

version=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
archive="dist/boxdhide-$version.zip"

mkdir -p dist
rm -f "$archive"
zip -rqX "$archive" manifest.json src icons -x '*.DS_Store'
echo "$archive"
