# ☁ Noveria Football Universe 4.1 — Una misma partida en PC y celular

El código ya incluye el sistema global. Para activarlo necesitás conectar un proyecto Supabase (GitHub Pages, por sí solo, no almacena partidas).

## 1. Respaldá tu partida actual
En Noveria, entrá a **Palmarés y partida → Descargar copia JSON**. Guardá el archivo en tu equipo. No lo borres.

## 2. Crear o elegir tu proyecto Supabase
Entrá a https://supabase.com/dashboard, creá un proyecto nuevo para Noveria o elegí uno existente que administrés. No es necesario subir ninguna base de datos de futbolistas; el servidor guarda un documento JSON privado por cuenta.

## 3. Crear la tabla privada
En Supabase, abrí **SQL Editor → New query**, pegá el archivo **`SUPABASE_SETUP.sql`** y pulsá **Run**. Este SQL configura políticas RLS y evita que otros usuarios lean tus partidas.

## 4. Obtener las claves correctas
Buscá la **Project URL** y una **publishable key** o **anon key** en Project Settings → API Keys (los nombres pueden variar). Nunca copies claves llamadas **service_role**, **sb_secret_** ni tokens de administración.

Elegí una forma de configurar:
- **Una sola vez desde GitHub:** editá `cloud-config.js` y rellená `SUPABASE_URL` y `SUPABASE_ANON_KEY` con la URL y *clave pública*. Si publicás este archivo, no incluyas claves secretas.
- **Desde el juego:** abrí **Nube y sincronización** e introducí URL y clave pública. Hacelo en PC y celular (una vez en cada dispositivo).

## 5. Crear cuenta / iniciar sesión
En el menú **Nube y sincronización**, tocá **Crear cuenta** o **Iniciar sesión** con email y contraseña. Usá la misma cuenta en PC y móvil. Si pide verificar correo, revisá tu bandeja y confirmá el email.

## 6. Primera sincronización: elegir la partida correcta
En PC, con la partida más avanzada abierta, tocá **Subir mi partida actual**. Si ya existe otra en la nube, la app pedirá confirmación antes de sustituirla.
En móvil, iniciá sesión con la misma cuenta y elegí **Usar la partida de la nube**. Si ya se había sincronizado anteriormente y no existen cambios locales, se abrirá automáticamente la versión más reciente.

Después de esto, los resultados, fichajes, ligas extranjeras, DT, torneos y campeones se subirán automáticamente al guardar, normalmente unos segundos después de cada cambio. Si no hay internet, queda el respaldo local; al reconectar puede sincronizar. Si ambos dispositivos hacen cambios diferentes, la app solicita decidir cuál conservar: **no fusiona partidas de forma automática**.

## 7. Subir los archivos a GitHub
Descargá `Noveria_V4_1_SOLO_MODIFICADOS.zip`, descomprimí, subí los archivos a la raíz de tu repositorio y hacé commit. Los archivos `cloud-sync.js`, `cloud-config.js` y `SUPABASE_SETUP.sql` son nuevos. Usá la versión completa si el repositorio está desactualizado.

**Nota:** esta actualización no crea automáticamente el proyecto Supabase, la tabla ni la cuenta. Esos pasos requieren que los hagás en tu panel; no se pueden completar sin las credenciales y tu autorización.
