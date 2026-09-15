# Acceder a los datos del volumen Docker

Este proyecto guarda los datos de MySQL en el volumen nombrado `mysql_clientes_data`.
Segun `docker-compose.yml`, ese volumen esta montado dentro del contenedor `clientes_mysql` en esta ruta:

```text
/var/lib/mysql
```

La base de datos usada por la API es:

```text
Base de datos: clientes_db
Usuario: clientes_user
Password: clientes_pass
Root password: root_pass
Contenedor MySQL: clientes_mysql
Volumen Docker: mysql_clientes_data
```

## 1. Levantar los contenedores

Desde la raiz del proyecto ejecuta:

```bash
docker compose up --build
```

Si ya construiste la imagen antes, tambien puedes usar:

```bash
docker compose up
```

## 2. Verificar que el volumen existe

Lista los volumenes de Docker:

```bash
docker volume ls
```

Busca el volumen:

```text
mysql_clientes_data
```

Tambien puedes inspeccionarlo con:

```bash
docker volume inspect apirest_docker_mysql_clientes_data
```

Docker Compose normalmente agrega el nombre de la carpeta del proyecto como prefijo al volumen. Por eso, aunque en `docker-compose.yml` el volumen se llama `mysql_clientes_data`, en Docker puede aparecer como `apirest_docker_mysql_clientes_data`.

## 3. Entrar al contenedor MySQL

Abre una terminal dentro del contenedor:

```bash
docker exec -it clientes_mysql bash
```

Dentro del contenedor, los archivos fisicos de MySQL estan en:

```bash
cd /var/lib/mysql
ls
```

No se recomienda editar manualmente los archivos de `/var/lib/mysql`, porque son archivos internos de MySQL. Para leer o modificar datos, usa el cliente `mysql`.

## 4. Acceder a la base de datos con MySQL

Puedes entrar como usuario de la aplicacion:

```bash
docker exec -it clientes_mysql mysql -u clientes_user -p clientes_db
```

Cuando pida password, escribe:

```text
clientes_pass
```

O puedes entrar como root:

```bash
docker exec -it clientes_mysql mysql -u root -p
```

Password de root:

```text
root_pass
```

## 5. Consultar los datos

Ya dentro de MySQL, selecciona la base de datos:

```sql
USE clientes_db;
```

Muestra las tablas:

```sql
SHOW TABLES;
```

Consulta los clientes:

```sql
SELECT * FROM clientes;
```

Sal de MySQL con:

```sql
exit;
```

## 6. Exportar los datos a un archivo SQL

Desde la raiz del proyecto, ejecuta:

```bash
docker exec clientes_mysql mysqldump -u root -proot_pass clientes_db > backup_clientes_db.sql
```

Esto crea el archivo `backup_clientes_db.sql` en tu maquina local.

## 7. Restaurar los datos desde un backup

Si tienes un archivo `backup_clientes_db.sql` en la raiz del proyecto, restauralo con:

```bash
docker exec -i clientes_mysql mysql -u root -proot_pass clientes_db < backup_clientes_db.sql
```

## 8. Detener contenedores sin borrar datos

Para detener los contenedores conservando el volumen:

```bash
docker compose down
```

Los datos seguiran guardados en el volumen Docker.

## 9. Borrar el volumen y todos los datos

Si quieres eliminar los contenedores y tambien borrar los datos de MySQL:

```bash
docker compose down -v
```

Este comando elimina el volumen asociado a MySQL. Usalo solo si ya no necesitas los datos o si tienes un backup.
