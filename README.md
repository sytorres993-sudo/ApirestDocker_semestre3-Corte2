# Clientes API

API REST con frontend para administrar clientes usando Spring Boot, Spring Data JPA, MySQL y Docker.

## Requisitos

- Docker
- Docker Compose

No necesitas instalar Maven localmente; el `Dockerfile` compila la aplicacion dentro de un contenedor Maven.

## Ejecutar

```bash
docker compose up --build
```

La aplicacion quedara disponible en:

```text
http://localhost:8080
```

El frontend se abre en `/` y la API queda en `/api/clientes`.

MySQL quedara disponible en `localhost:3306` con estos datos:

```text
Base de datos: clientes_db
Usuario: clientes_user
Password: clientes_pass
Root password: root_pass
```

Los datos de MySQL se guardan en el volumen Docker `mysql_clientes_data`.

## Detener

```bash
docker compose down
```

Para borrar tambien el volumen de MySQL y eliminar los datos:

```bash
docker compose down -v
```

## Modelo Cliente

```json
{
  "id": 1,
  "nombre": "Ana Perez",
  "email": "ana.perez@example.com",
  "telefono": "+57 300 123 4567",
  "direccion": "Calle 123 #45-67",
  "creadoEn": "2026-09-04T10:00:00",
  "actualizadoEn": "2026-09-04T10:00:00"
}
```

## Endpoints

### Listar clientes

```http
GET /api/clientes
```

Respuesta `200 OK`.

### Buscar cliente por ID

```http
GET /api/clientes/{id}
```

Respuesta `200 OK`. Si no existe, devuelve `404 Not Found`.

### Crear cliente

```http
POST /api/clientes
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Ana Perez",
  "email": "ana.perez@example.com",
  "telefono": "+57 300 123 4567",
  "direccion": "Calle 123 #45-67"
}
```

Respuesta `201 Created`. Si el email ya existe, devuelve `409 Conflict`.

### Actualizar cliente

```http
PUT /api/clientes/{id}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Ana Perez Actualizada",
  "email": "ana.perez@example.com",
  "telefono": "+57 301 987 6543",
  "direccion": "Carrera 10 #20-30"
}
```

Respuesta `200 OK`. Si no existe, devuelve `404 Not Found`. Si el email pertenece a otro cliente, devuelve `409 Conflict`.

### Eliminar cliente

```http
DELETE /api/clientes/{id}
```

Respuesta `204 No Content`. Si no existe, devuelve `404 Not Found`.

## Validaciones

- `nombre`: obligatorio, maximo 120 caracteres.
- `email`: obligatorio, formato de email valido, unico, maximo 160 caracteres.
- `telefono`: opcional, maximo 30 caracteres.
- `direccion`: opcional, maximo 255 caracteres.

Si la solicitud no cumple las validaciones, la API devuelve `400 Bad Request`.

## Pruebas en Postman

Importa este archivo en Postman:

```text
postman/Clientes_API.postman_collection.json
```

La coleccion usa la variable `base_url` con valor `http://localhost:8080`.

Flujo recomendado:

1. Ejecuta `Crear cliente`.
2. Ejecuta `Buscar cliente por ID`.
3. Ejecuta `Actualizar cliente`.
4. Ejecuta `Listar clientes`.
5. Ejecuta `Eliminar cliente`.

La prueba `Crear cliente` guarda automaticamente el `id` creado en la variable `cliente_id`.

## Frontend

La interfaz web permite listar, crear, editar, eliminar y buscar clientes. En Railway queda disponible en la misma URL publica del backend:

```text
https://clientes-api-production-cfb4.up.railway.app
```
