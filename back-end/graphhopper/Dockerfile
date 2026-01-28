FROM eclipse-temurin:17-jre

WORKDIR /graphhopper

# ferramentas básicas
RUN apt-get update && apt-get install -y --no-install-recommends wget ca-certificates && rm -rf /var/lib/apt/lists/*

ENV GH_VERSION=12.0

# If a local JAR is present in the build context, copy it into the image for offline builds
COPY graphhopper-web-12.0.jar /graphhopper/graphhopper-web-12.0.jar
RUN ln -s /graphhopper/graphhopper-web-12.0.jar /graphhopper/graphhopper-web.jar || true
# Copy config if present in the repo
COPY config.yml /graphhopper/config.yml
# Copy a chosen PBF into the image to avoid host bind mount issues (choose brasil PBF)
COPY data/brazil-251208.osm.pbf /graphhopper/data/brazil-251208.osm.pbf
RUN mkdir -p /graphhopper/logs

# Entrypoint script para permitir passar comandos como 'import' e 'web'
COPY entrypoint.sh /graphhopper/entrypoint.sh
RUN chmod +x /graphhopper/entrypoint.sh

VOLUME ["/data"]
EXPOSE 8989

ENTRYPOINT ["/graphhopper/entrypoint.sh"]
