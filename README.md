# 🦊 FoxSuite (ReaFox Files)

Plataforma de servicios web multimedia que incluye almacenamiento de archivos (**FoxDrop**), descarga de medios de redes sociales (**FoxGet**), y conversión multimedia (**FoxConvert**).

---

## 📂 Estructura del Proyecto

```text
/opt/reafox-files/
├── compose.yml           # Definición de servicios Docker, límites de CPU/RAM y volúmenes
├── Dockerfile            # Construcción de la imagen (Python 3.11 + Node runtime + FFmpeg)
├── requirements.txt      # Dependencias de Python (Flask, Gunicorn, yt-dlp, etc.)
│
├── app.py                # Servidor principal Flask y backend de FoxDrop/FoxConvert
├── foxget.py             # Módulo Blueprint y lógica de descarga de FoxGet (yt-dlp)
├── sync.sh               # Script de sincronización / despliegue
│
├── caddy/
│   └── Caddyfile         # Configuración del proxy inverso, TLS automático y cabeceras de seguridad
├── templates/            # Plantillas Jinja2 / HTML (interfaz web de usuario)
│   ├── base.html         # Plantilla base (layout, favicon, estilos)
│   ├── index.html        # Portal principal
│   ├── foxget.html       # Interfaz de FoxGet
│   └── share.html        # Página de descarga de enlaces compartidos
├── static/               # Recursos estáticos servidos por Caddy (CSS, JS, iconos, logos)
└── tools/                # Scripts auxiliares y herramientas de conversión

/opt/reafox-secrets/      # Secretos montados en modo solo lectura en Docker
├── link-password.key     # Clave de cifrado de contraseñas de archivos
├── youtube-cookies/      # Cookies para el extractor de YouTube
└── instagram-cookies/    # Cookies para el extractor de Instagram
```

---

## 🐳 Servicios en Docker Compose

1. **`caddy`**: Proxy inverso HTTPS con certificados SSL automáticos de Let's Encrypt y cabeceras de seguridad estrictas (HSTS, CSP, nosniff).
2. **`app`**: Servidor WSGI Gunicorn (Python/Flask) corriendo en el puerto 8080. Montado en `:ro` para proteger el código.
3. **`previews`**: Worker en segundo plano que procesa vistas previas y miniaturas con FFmpeg (`python app.py preview-loop`).
4. **`cleaner`**: Worker que limpia automáticamente archivos temporales y respeta la cuota máxima configurada de almacenamiento (`python app.py clean-loop`).
5. **`bgutil`**: Contenedor auxiliar `bgutil-ytdlp-pot-provider` que suministra tokens PO para evitar bloqueos de YouTube en `yt-dlp`.

---

## 🛠️ Comandos de Administración

* **Ver estado de los contenedores**:
  ```bash
  docker compose -f /opt/reafox-files/compose.yml ps
  ```
* **Ver uso de CPU y memoria en tiempo real**:
  ```bash
  docker stats --no-stream
  ```
* **Ver registros en vivo**:
  ```bash
  docker compose -f /opt/reafox-files/compose.yml logs -f app
  ```
* **Reiniciar servicios de la aplicación**:
  ```bash
  docker compose -f /opt/reafox-files/compose.yml restart app cleaner previews
  ```
