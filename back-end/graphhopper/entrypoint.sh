#!/bin/sh
# Entrypoint: se receber 'server' e o cache estiver vazio, faz import antes de subir
cmd="$(basename "$1")"
if [ "$cmd" = "server" ]; then
  # Se não existir arquivo de propriedades do EncodingManager, executar import primeiro
  if [ ! -f /graphhopper/graph-cache/encoded_values.properties ] && [ ! -f /graphhopper/graph-cache/graph.properties ]; then
    echo "[entrypoint] graph-cache vazio ou sem propriedades — removendo diretório e executando 'import' primeiro"
    rm -rf /graphhopper/graph-cache || true
    java -jar /graphhopper/graphhopper-web.jar import /graphhopper/config.yml || {
      echo "[entrypoint] import falhou"
      exit 1
    }
  fi
  exec java -jar /graphhopper/graphhopper-web.jar server /graphhopper/config.yml
elif [ "$cmd" = "import" ] || [ "$cmd" = "web" ]; then
  exec java -jar /graphhopper/graphhopper-web.jar "$@"
else
  exec "$@"
fi
