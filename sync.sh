#!/bin/bash
set -e
echo "El código ya está montado en /app; reiniciando la aplicación..."
docker compose restart app
echo "¡Listo! Aplicación reiniciada."
