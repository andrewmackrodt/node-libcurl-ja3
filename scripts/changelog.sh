#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd -P)"

CHANGELOG="../CHANGELOG.md"

if [[ $# != 1 ]]; then
  echo "usage: ./${BASH_SOURCE[0]} <tag>" >&2
  exit 1
fi

start=
end=

for line in $(grep -nE '^## \[' "$CHANGELOG" | sed -nE 's/([0-9]+):.+\[([^]]+)\].*/\2:\1/p'); do
  if [[ "$start" == "" ]]; then
    if [[ "$line" == "$1:"* ]]; then
      start=$(echo "$line" | cut -d: -f2)
      continue
    fi
  else
    end=$(echo "$line" | cut -d: -f2)
    break
  fi
done

if [[ "$start" == "" ]]; then
  echo "error: could not parse tag $1 from changelog" >&2
  exit 1
fi

if [[ "$end" == "" ]]; then
  tail -n+$((start + 1)) "$CHANGELOG" | perl -0777 -pe 's/\n{2,}$/\n/'
else
  head -n$((end - 1)) "$CHANGELOG" | tail -n+$((start + 1)) | perl -0777 -pe 's/^\n+//' | perl -0777 -pe 's/\n{2,}$/\n/'
fi
