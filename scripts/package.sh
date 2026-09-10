#!/bin/sh
# Builds the store uploads:
#   dist/boxdhide-<version>-chrome.zip   Chrome Web Store
#   dist/boxdhide-<version>-firefox.zip  Firefox Add-ons (AMO)
set -eu
cd "$(dirname "$0")/.."

version=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
cp -R src icons "$stage/"
mkdir -p dist

# Zips the staged files with the manifest currently in the stage.
pack() {
  archive="$PWD/dist/boxdhide-$version-$1.zip"
  rm -f "$archive"
  (cd "$stage" && zip -rqX "$archive" manifest.json src icons -x '*.DS_Store')
  echo "dist/boxdhide-$version-$1.zip"
}

cp manifest.json "$stage/manifest.json"
pack chrome

# Firefox needs an add-on ID and a data collection declaration, and ignores the Chrome-only key.
python3 - "$stage/manifest.json" <<'EOF'
import json, sys

with open('manifest.json') as f:
    manifest = json.load(f)
manifest.pop('minimum_chrome_version', None)
manifest['browser_specific_settings'] = {
    'gecko': {
        'id': 'boxdhide@mo-gd.github.io',
        'strict_min_version': '140.0',
        'data_collection_permissions': {'required': ['none']},
    },
}
with open(sys.argv[1], 'w') as f:
    json.dump(manifest, f, indent=2)
EOF
pack firefox
