#!/bin/bash

# abort on errors
set -e

scriptDir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$scriptDir"
cd ../

echo "Enter domain:"
read domain
echo ""

echo "Will use 'docker-compose.yml' file to detect ssl volume"

path=`grep -oP '[\w/\.-]+(?=:/etc/nginx/ssl)' docker-compose.yml`
path="$path/$domain"

if [ -d "$path" ]; then
  echo ""
  echo "|================================================"
  echo "|=== $path ALREADY EXISTS!"
  echo "|=== remember to RELOAD the NGINX"
  echo "|================================================"
  echo ""
fi

mkdir -p "$path"
openssl genrsa -out "$path/private.key" 2048 2>/dev/null

cat >"$path/ssl.conf" <<EOL
[req]
distinguished_name=req
[SAN]
subjectAltName=DNS:${domain}, DNS:*.${domain}
EOL

openssl req -new -x509 -key "$path/private.key" -out "$path/public.key" -days 3650 -subj "/CN=*.$domain" -extensions SAN -config "$path/ssl.conf"
rm -f "$path/ssl.conf"

echo "Generated $path/private.key"
echo "Generated $path/public.key"

echo "Done"
