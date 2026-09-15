# Despliegue en Railway

Esta app esta preparada para desplegarse en Railway usando el `Dockerfile` del proyecto.

## Servicios necesarios

En Railway crea estos servicios dentro del mismo proyecto:

1. Un servicio MySQL administrado.
2. Un servicio para esta API, desplegado desde este repositorio o con Railway CLI.

Railway no usa el `docker-compose.yml` para produccion. El `docker-compose.yml` queda solo para desarrollo local.

## Variables de entorno de la API en Railway

La app puede leer automaticamente estas variables si Railway las expone desde el servicio MySQL:

```text
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
PORT
```

En este despliegue se dejo configurada la API con `SPRING_DATASOURCE_URL` apuntando al TCP proxy del servicio MySQL, y con usuario/clave por referencia al servicio MySQL:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://<tcp-proxy-host>:<tcp-proxy-port>/railway?sslMode=DISABLED&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

Esto evita copiar secretos manualmente en la API.

## Puerto

Railway asigna el puerto usando la variable `PORT`.
Spring Boot esta configurado para leerla:

```properties
server.port=${PORT:${SERVER_PORT:8080}}
server.address=0.0.0.0
```

## Dockerfile

Railway detecta el `Dockerfile` y construye la app con Maven. El contenedor arranca con:

```dockerfile
CMD ["java", "-jar", "app.jar"]
```

## Despliegue con Railway CLI

Desde la raiz del proyecto:

```bash
railway login
railway init
railway add --database mysql
railway up
railway domain
```

Despues de crear MySQL, configura las variables de la API apuntando al servicio MySQL desde el panel de Railway.

> Railway muestra una advertencia indicando que `railway.json` sigue funcionando, pero Config as Code queda deprecado el 2026-12-01. Para migrarlo cuando quieras:
>
> ```bash
> railway config migrate
> ```
