#!/bin/bash

# abort on errors
set -e

scriptDir="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$scriptDir"
cd ../

if [ -f ".env" ]; then
  export $(cat .env | xargs)
fi

if [[ -z "${RT_APP_DOMAIN}" ]]; then
  echo "Enter domain:"
  read domain
  echo ""
else
  domain="${RT_APP_DOMAIN}"
fi

echo "Will use 'docker-compose.yml' file to detect config volume"
echo "Will use 'docker-compose.yml' to detect proxy (#-proxy) and static (#-static) locations"
echo ""


filepath=`grep -oP '[\w/\.-]+(?=:/etc/nginx/conf\.d/default\.conf)' docker-compose.yml`
echo "  $filepath"

if [ -f "$filepath" ]; then
  echo ""
  echo "|================================================"
  echo "|=== $filepath ALREADY EXISTS!"
  echo "|=== remember to RELOAD the NGINX"
  echo "|================================================"
  echo ""
fi

mkdir -p "${filepath%/*}"

pbKey="/etc/nginx/ssl/$domain/public.key"
pvKey="/etc/nginx/ssl/$domain/private.key"



proxySet=$(cat <<EOL
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
EOL
)
staticSet=$(cat <<EOL
    sendfile on;
EOL
)
namePattern="^  \w+:"
proxyPattern="^      - '[0-9]+' #-proxy "
staticPattern=":[a-zA-Z0-9/\.-]+ #-static"
name=""

while IFS= read -r line ; do
if [[ $line =~ $namePattern ]]; then
name=$(echo $line | tr -d '\r')
elif [[ $name =~ .+ && $line =~ $proxyPattern ]]; then
port=$(echo $line | grep -oP "\- '[0-9]+' #-proxy" | rev | cut -c 10- | rev | cut -c 4- | tr -d '\r')
path=$(echo $line | grep -oP " #-proxy .+" | cut -c 10- | tr -d '\r')
echo "  proxy $path $name$port"
locations=$(cat <<EOL
${locations}

  location ${path} {
${proxySet}
    proxy_pass http://${name}${port};
  }
EOL
)
elif [[ $name =~ .+ && $line =~ $staticPattern ]]; then
rootPath=$(echo $line | grep -oP ":\/[a-zA-Z0-9\.-]+" | cut -c 2- | tr -d '\r')
path=$(echo $line | grep -oP " #-static .+" | cut -c 11- | tr -d '\r')
echo "  static $path => $rootPath"
locations=$(cat <<EOL


  location ${path} {
${staticSet}
    root ${rootPath};
  }${locations}
EOL
)
fi
done <<< "`sed -n '/^services:/,/^\w/{p}' docker-compose.yml`"

server=$(cat <<EOL
  server_name ${domain} *.${domain};
  keepalive_timeout 100s;
${locations}
EOL
)

staticCache=$(cat <<EOL
  location ~* \.(mp4|m4v|mp3|gif|jpe?g|png) {
    proxy_cache rt_static_cache;
  }
EOL
)

cat >"$filepath" <<EOL
client_max_body_size 50M;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 15m;

proxy_cache_path /usr/lib/nginx/cache levels=1:2 keys_zone=rt_static_cache:10m max_size=2g inactive=60m use_temp_path=off;

server {
  listen 80;

${staticCache}

${server}
}

server {
  listen 443 ssl;
  ssl_certificate ${pbKey};
  ssl_certificate_key ${pvKey};

${staticCache}

${server}
}
EOL
echo ""

echo "Generated $filepath"
echo "Done"
