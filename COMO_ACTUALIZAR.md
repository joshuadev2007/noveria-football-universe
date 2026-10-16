# Actualizar Noveria a 4.2 — acceso solo por correo

1. En tu Noveria actual, descargá un respaldo JSON de la partida.
2. Descomprimí `Noveria_V4_2_SOLO_MODIFICADOS.zip` y subí su contenido a la **raíz** del repositorio de Noveria en GitHub, reemplazando los archivos viejos.
3. En GitHub editá **una vez** `cloud-config.js`, introduciendo **Project URL** y **publishable/anon key pública** de Joshua Cloud. Commit. Nunca uses secret/service_role.
4. En Supabase → Joshua Cloud → Authentication → URL Configuration, **añadí** `https://joshuadev2007.github.io/noveria-football-universe/` a **Redirect URLs** (no modifiques Site URL ni borres las existentes).
5. Abrí Noveria → ☁ Nube y sincronización → correo electrónico → Enviar código. Usá el enlace recibido en tu correo. Si preferís código numérico, añadí `{{ .Token }}` a la plantilla existente de Magic Link / OTP, sin borrar su enlace.
6. En el dispositivo que ya tiene la partida, subí su respaldo a la nube. En el segundo dispositivo entrá con el mismo email y recuperá la partida.

**NO hace falta volver a ejecutar SQL** si ya ejecutaste `SUPABASE_SETUP.sql` con éxito. Para más detalles: `CONFIGURAR_NUBE.md`.
