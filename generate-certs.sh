#!/bin/bash
mkdir -p nginx/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/certs/server.key \
    -out nginx/certs/server.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=RSX103/CN=rsx103cnam.ddns.net"

echo "✅ Certificats générés dans nginx/certs/"
ls -lah nginx/certs/
chmod 644 nginx/certs/server.crt
chmod 600 nginx/certs/server.key