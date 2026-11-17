# 🦊 FoxSuite

Plataforma de servicios web multimedia que incluye almacenamiento y compartición de archivos (**FoxDrop**), descarga de medios desde redes sociales (**FoxGet**) y conversión multimedia acelerada (**FoxConvert**).

---

## 📂 Estructura del Repositorio

```text
foxsuite/
├── .gitignore            # Excluye datos en ejecución (data/), secretos, respaldos y caché
├── compose.yml           # Orquestación de servicios Docker, límites de recursos y volúmenes
├── Dockerfile            # Construcción de imagen (Python 3.11 + Node + FFmpeg)
├── requirements.txt      # Dependencias de Python (Flask, Gunicorn, yt-dlp, etc.)
├── README.md             # Documentación técnica del proyecto
│
├── app.py                # Servidor principal Flask y backend (FoxDrop, Auth, SQLite WAL)
├── foxget.py             # Blueprint y lógica de descargas multimedia (yt-dlp)
├── sync.sh               # Script de sincronización y despliegue
│
├── caddy/
│   └── Caddyfile         # Proxy inverso, TLS automático y cabeceras de seguridad (CSP/HSTS)
│
├── templates/            # Vistas HTML / Jinja2
│   ├── base.html         # Plantilla base
│   ├── index.html        # Portal principal SPA
│   ├── foxget.html       # Vista independiente de FoxGet
│   ├── share.html        # Página pública de descarga de enlaces compartidos
│   ├── message.html      # Pantalla de avisos y errores
│   ├── module_unavailable.html
│   ├── icons10/          # Iconos SVG embebidos en interfaz
│   └── views/            # Vistas modulares (home, upload, files, foxconvert, foxget, users, profile)
│
├── static/               # Recursos estáticos (CSS, JS, fuentes, iconos y bundle de FoxConvert)
└── tools/
    └── foxconvert/       # Scripts y empaquetado del motor de conversión multimedia
```

> **Nota sobre directorios ignorados en Git:** Las carpetas `data/` (base de datos SQLite, archivos subidos, sesiones y cookies) y `/opt/reafox-secrets/` (claves de cifrado) no forman parte del repositorio por seguridad.

---

## 🚀 Puesta en Marcha (Entorno de Desarrollo)

Para levantar el proyecto tras clonar el repositorio (`git clone https://github.com/ReafoxTV/foxsuite.git`):

1. **Crear los directorios de datos y secretos locales:**
   ```bash
   mkdir -p data/foxget secrets
   openssl rand -hex 32 > secrets/link-password.key
   ```

2. **Ajustar rutas de secretos (si no se usa `/opt/reafox-secrets/`):**
   Asegúrate de que en tu `compose.yml` local el volumen de secretos apunte a `./secrets:/run/secrets:ro` (o crea `/opt/reafox-secrets/link-password.key` en tu máquina).

3. **Construir y levantar los contenedores:**
   ```bash
   docker compose up -d --build
   ```

---

## 🐳 Servicios en Docker Compose

1. **`caddy`**: Proxy inverso HTTPS con certificados SSL automáticos y cabeceras de seguridad estrictas (HSTS, CSP, `nosniff`, caché inmutable para `/static/*`).
2. **`app`**: Servidor WSGI Gunicorn (Python/Flask) corriendo en el puerto `8080`. Montado en modo solo lectura (`:ro`) para proteger el código fuente.
3. **`previews`**: Worker en segundo plano que genera vistas previas y miniaturas con FFmpeg (`python app.py preview-loop`).
4. **`cleaner`**: Worker encargado de purgar archivos expirados y mantener la cuota de almacenamiento (`python app.py clean-loop`).
5. **`bgutil`**: Proveedor de tokens PO (`bgutil-ytdlp-pot-provider`) en el puerto interno `4416` para evitar bloqueos de YouTube en `yt-dlp`.

---

## 🛠️ Comandos de Administración

* **Ver estado de los contenedores:**
  ```bash
  docker compose ps
  ```
* **Ver uso de CPU y memoria en tiempo real:**
  ```bash
  docker stats --no-stream
  ```
* **Ver registros en vivo de la aplicación:**
  ```bash
  docker compose logs -f app
  ```
* **Actualizar tras recibir cambios desde GitHub:**
  ```bash
  git pull origin main
  docker compose up -d --build
  ```
* **Reiniciar servicios de la aplicación:**
  ```bash
  docker compose restart app cleaner previews
  ```
