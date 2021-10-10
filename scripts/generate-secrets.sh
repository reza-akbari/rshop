#!/bin/bash

# abort on errors
set -e

scriptDir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$scriptDir"
cd ../

echo "Will use 'docker-compose.yml' file to detect secrets"
echo "Will use 'openssl' to generate values"

grep -oP 'file: \K\./\.secrets/[\w/\.-]+' docker-compose.yml | while read -r line ; do
  if [ -f "$line" ]; then
    echo "  $line ALREADY EXISTS! not generating new one"
  else
    mkdir -p "${line%/*}" && printf '%s' "$(openssl rand -base64 18)" > $line
    echo "  Generated: $line"
  fi
done
echo "Done"
