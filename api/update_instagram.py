#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DoubleImpactStore — Instagram_Updater
====================================
Sincroniza los posts de Instagram con el hashtag #DoubleImpactStoreWeb
y genera las variantes WebP (400/800/1200) usando Pillow.

Requisitos de entorno:
    INSTAGRAM_TOKEN  -> Token de larga duración (IGAA...) de la API de Instagram
                         con inicio de sesión de Instagram. NO debe versionarse:
                         en GitHub es un Secret; en local, va en .env.

Salidas (solo si hay cambios significativos; los likes no cuentan):
    - js/instagram_posts.js y js/instagram_posts.min.js (datos de posts)
    - img/IG_<id>.jpeg + variantes _400/_800/_1200.webp
    - Versión (?v=YYYY-MM-DD_HHMM) de instagram_posts.min.js en todos los *.html
    - CACHE_VERSION de service-worker.js, solo si se agregan o eliminan posts
    - commit_message.txt (lo usa el workflow)

Si el token es inválido/expirado, termina con código de salida 1.
"""

import os
import sys
import glob
import json
import requests
import re
from datetime import datetime
from PIL import Image


def detect_instagram_error(payload):
    """Detecta si la respuesta de Instagram indica un token expirado o inválido."""
    error = payload.get('error', {}) if isinstance(payload, dict) else {}
    message = error.get('message', '')
    error_type = error.get('type', '')
    code = error.get('code')

    if error_type == 'OAuthException' and code == 190:
        return {
            'is_expired_token': True,
            'message': 'El token de Instagram ha expirado o es inválido. Renueva el token y vuelve a ejecutar el script.'
        }

    if 'access token' in message.lower() or 'token' in message.lower():
        return {
            'is_expired_token': True,
            'message': message or 'El token de Instagram ha expirado o es inválido.'
        }

    return {
        'is_expired_token': False,
        'message': message or 'Error inesperado al consultar Instagram.'
    }


def load_env():
    """Lee .env localmente si existe (en GitHub Actions el token llega como Secret)."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # Fallback manual si python-dotenv no está instalado
        if os.path.exists('.env'):
            with open('.env') as f:
                for line in f:
                    line = line.strip()
                    if line and '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        os.environ.setdefault(key.strip(), value.strip())


def redact(text, token):
    """Oculta el token en mensajes de error (las URLs de requests lo incluyen)."""
    text = str(text)
    return text.replace(token, '***') if token else text


# CONFIGURACIÓN
HASHTAG_FILTER = '#DoubleImpactStoreWeb'
MEDIA_URL = 'https://graph.instagram.com/me/media'
MEDIA_FIELDS = 'id,caption,media_type,media_url,permalink,timestamp,like_count,children{media_url,media_type}'
JS_FILE_PATH = 'js/instagram_posts.js'
MIN_JS_FILE_PATH = 'js/instagram_posts.min.js'
HTML_GLOB = '*.html'
SW_FILE_PATH = 'service-worker.js'
IMAGE_DIR = 'img/'
MAX_POSTS = 1000  # Número máximo de posts a obtener
# Campos cuyo cambio justifica regenerar los datos. Los likes quedan fuera:
# cambian a diario y generarían commits y despliegues sin valor.
SIGNIFICANT_FIELDS = ('title', 'description', 'image', 'link')


def fetch_instagram_media(token):
    """Obtiene los posts recientes del usuario con paginación."""
    all_media = []
    url = MEDIA_URL
    params = {'fields': MEDIA_FIELDS, 'limit': 25, 'access_token': token}

    while url and len(all_media) < MAX_POSTS:
        try:
            response = requests.get(url, params=params, timeout=30)
        except requests.RequestException as exc:
            print(f"Error de red al conectar con Instagram: {redact(exc, token)}")
            return None

        if response.status_code != 200:
            error_payload = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            error_info = detect_instagram_error(error_payload)
            print(f"Error al conectar con Instagram: {redact(response.text, token)}")
            print(error_info['message'])
            return None

        data = response.json()
        if 'error' in data:
            error_info = detect_instagram_error(data)
            print(f"Error al conectar con Instagram: {redact(json.dumps(data, ensure_ascii=False), token)}")
            print(error_info['message'])
            return None

        all_media.extend(data.get('data', []))

        # La URL de la siguiente página ya incluye todos los parámetros
        url = data.get('paging', {}).get('next')
        params = None

        if url:
            print(f"Obtenidos {len(all_media)} posts, continuando con la siguiente página...")

    print(f"Total de posts obtenidos de Instagram: {len(all_media)}")
    return all_media[:MAX_POSTS]  # Limitar al máximo configurado

def process_image_variants(source_path, post_id):
    """Genera versiones WebP en diferentes tamaños (400, 800, 1200)."""
    sizes = [400, 800, 1200]
    generated_files = []

    try:
        with Image.open(source_path) as img:
            # Asegurarse de que esté en RGB (por si es RGBA)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            for size in sizes:
                target_name = f"IG_{post_id}_{size}.webp"
                target_path = os.path.join(IMAGE_DIR, target_name)

                # Redimensionar manteniendo aspecto
                # Usamos un ratio para no deformar
                w_percent = (size / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))

                # Solo redimensionar si la imagen original es más grande que el target
                if img.size[0] > size:
                    resized_img = img.resize((size, h_size), Image.Resampling.LANCZOS)
                else:
                    resized_img = img

                resized_img.save(target_path, "WEBP", quality=85)
                generated_files.append(f"/img/{target_name}")

        print(f"Variantes WebP generadas para post {post_id}")
    except Exception as e:
        print(f"Error procesando variantes de imagen {post_id}: {e}")

    return generated_files

def download_image(url, post_id):
    """Descarga la imagen original y genera sus variantes optimizadas solo si no existen.

    Devuelve el nombre del JPEG, o None si no se pudo descargar.
    """
    temp_name = f"temp_{post_id}.jpg"
    temp_path = os.path.join(IMAGE_DIR, temp_name)
    final_image_name = f"IG_{post_id}.jpeg"
    final_path = os.path.join(IMAGE_DIR, final_image_name)

    # Si ya existen todas las variantes, no descargamos de nuevo
    variants_exist = all([
        os.path.exists(os.path.join(IMAGE_DIR, f"IG_{post_id}_400.webp")),
        os.path.exists(os.path.join(IMAGE_DIR, f"IG_{post_id}_800.webp")),
        os.path.exists(os.path.join(IMAGE_DIR, f"IG_{post_id}_1200.webp")),
        os.path.exists(final_path)
    ])

    if variants_exist:
        print(f"Imágenes ya existen para post {post_id}, omitiendo descarga.")
        return final_image_name

    print(f"Descargando nueva imagen para post {post_id}...")
    try:
        response = requests.get(url, timeout=60)
    except requests.RequestException:
        response = None
    if response is None or response.status_code != 200:
        print(f"Error al descargar imagen {post_id}; se omite el post en esta ejecución.")
        return None

    with open(temp_path, 'wb') as f:
        f.write(response.content)

    # Guardar una copia como JPEG original (el <img> de fallback del front la usa)
    with Image.open(temp_path) as img:
        img.convert("RGB").save(final_path, "JPEG", quality=90)

    # Generar los WebP optimizados
    process_image_variants(temp_path, post_id)

    # Borrar el temporal
    os.remove(temp_path)
    print(f"Imagen e imágenes WebP procesadas para: {post_id}")
    return final_image_name

def process_posts(media_list):
    """Filtra y procesa los posts con el hashtag especificado."""
    selected_posts = []
    for post in media_list:
        caption = post.get('caption', '')
        if HASHTAG_FILTER.lower() in caption.lower():
            media_type = post.get('media_type', '')
            media_url = post.get('media_url', '')

            # Omitir videos directos
            if media_type == 'VIDEO':
                print(f"Omitiendo post {post['id']} (tipo: VIDEO)")
                continue

            # Para carruseles, obtener la primera imagen
            if media_type == 'CAROUSEL_ALBUM':
                children = post.get('children', {}).get('data', [])
                if children:
                    # Buscar la primera imagen en el carrusel
                    first_image = None
                    for child in children:
                        if child.get('media_type') == 'IMAGE':
                            first_image = child.get('media_url')
                            break

                    if first_image:
                        media_url = first_image
                        print(f"Procesando carrusel {post['id']} (usando primera imagen)")
                    else:
                        print(f"Omitiendo carrusel {post['id']} (sin imágenes)")
                        continue
                else:
                    print(f"Omitiendo carrusel {post['id']} (sin hijos)")
                    continue

            clean_caption = caption.replace(HASHTAG_FILTER, '').replace(HASHTAG_FILTER.lower(), '').strip()

            lines = clean_caption.split('\n', 1)
            title = lines[0] if lines else "Nuevo Post"
            description = lines[1] if len(lines) > 1 else ""

            date_str = post['timestamp'][:10]

            # Esto ahora descarga Y genera los WebP
            img_filename = download_image(media_url, post['id'])
            if img_filename is None:
                continue

            selected_posts.append({
                'id': f"ig_auto_{post['id']}",
                'image': f"img/{img_filename}",
                'title': title,
                'description': description,
                'link': post['permalink'],
                'media_type': post['media_type'],
                'date': date_str,
                'likes': post.get('like_count', 0)
            })
    return selected_posts

def load_existing_posts():
    """Carga los posts existentes desde el archivo JS."""
    if not os.path.exists(JS_FILE_PATH):
        return []

    try:
        with open(JS_FILE_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            # Extraer el JSON del archivo JS
            match = re.search(r'const INSTAGRAM_POSTS_DATA = (\[.*?\]);', content, re.DOTALL)
            if match:
                return json.loads(match.group(1))
    except Exception as e:
        print(f"Error al leer posts existentes: {e}")

    return []

def post_differs(old_post, new_post):
    """True si el post cambió en algún campo significativo (ignora likes)."""
    return any(old_post.get(field) != new_post.get(field) for field in SIGNIFICANT_FIELDS)

def calculate_changes(old_posts, new_posts):
    """Calcula (agregados, modificados, eliminados) entre posts antiguos y nuevos."""
    old_posts_dict = {post['id']: post for post in old_posts}
    new_posts_dict = {post['id']: post for post in new_posts}
    old_ids = set(old_posts_dict)
    new_ids = set(new_posts_dict)

    added = len(new_ids - old_ids)
    deleted = len(old_ids - new_ids)
    modified = sum(
        1 for post_id in old_ids & new_ids
        if post_differs(old_posts_dict[post_id], new_posts_dict[post_id])
    )
    return added, modified, deleted

def posts_have_changed(old_posts, new_posts):
    """Compara los posts para detectar cambios significativos."""
    return any(calculate_changes(old_posts, new_posts))

def cleanup_removed_images(old_posts, new_posts):
    """Elimina las imágenes IG_ de posts que ya no están en la lista activa."""
    new_ids = set()
    for post in new_posts:
        # Extraer el ID real del Instagram desde el id del post (formato: ig_auto_XXXXXXXXX)
        raw_id = post['id'].replace('ig_auto_', '')
        new_ids.add(raw_id)

    removed = 0
    for post in old_posts:
        raw_id = post['id'].replace('ig_auto_', '')
        if raw_id not in new_ids:
            # Eliminar todas las variantes de imagen para este post
            variants = [
                os.path.join(IMAGE_DIR, f"IG_{raw_id}.jpeg"),
                os.path.join(IMAGE_DIR, f"IG_{raw_id}_400.webp"),
                os.path.join(IMAGE_DIR, f"IG_{raw_id}_800.webp"),
                os.path.join(IMAGE_DIR, f"IG_{raw_id}_1200.webp"),
            ]
            for path in variants:
                if os.path.exists(path):
                    os.remove(path)
                    print(f"  🗑️  Eliminada imagen: {path}")
                    removed += 1

    if removed > 0:
        print(f"Total imágenes eliminadas: {removed}")
    else:
        print("No hay imágenes huérfanas que eliminar.")

    return removed


def update_html_versions(version):
    """Actualiza el ?v= de instagram_posts.min.js en todas las páginas."""
    pattern = r"instagram_posts\.min\.js\?v=[^\"']+"
    replacement = f"instagram_posts.min.js?v={version}"
    for html_path in sorted(glob.glob(HTML_GLOB)):
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
        new_html = re.sub(pattern, replacement, html)
        if new_html != html:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(new_html)


def bump_sw_cache_version(version):
    """Cambia CACHE_VERSION: el Service Worker se reinstala y descarta la caché anterior."""
    if not os.path.exists(SW_FILE_PATH):
        return
    with open(SW_FILE_PATH, 'r', encoding='utf-8') as f:
        sw_content = f.read()
    sw_content = re.sub(r"const CACHE_VERSION = '[^']+';", f"const CACHE_VERSION = '{version}';", sw_content)
    with open(SW_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(sw_content)
    print("Service Worker: nueva CACHE_VERSION (cambió el conjunto de imágenes)")


def update_files(new_posts):
    """Actualiza datos, versiones de las páginas y Service Worker solo si hay cambios significativos."""
    if not new_posts:
        print("No se encontraron posts nuevos con el hashtag.")
        return

    # Cargar posts existentes y comparar
    existing_posts = load_existing_posts()

    if not posts_have_changed(existing_posts, new_posts):
        print("No hay cambios significativos en los posts de Instagram (los likes no cuentan). No se requiere actualización.")
        # No tocar commit_message.txt si no hay cambios
        return

    # Calcular estadísticas de cambios
    added, modified, deleted = calculate_changes(existing_posts, new_posts)

    print(f"Se detectaron cambios en los posts:")
    print(f"  - Agregados: {added}")
    print(f"  - Modificados: {modified}")
    print(f"  - Eliminados: {deleted}")

    # Eliminar imágenes de posts que ya no están activos
    if deleted > 0:
        print("Limpiando imágenes de posts eliminados...")
        cleanup_removed_images(existing_posts, new_posts)

    # Guardar mensaje de commit
    commit_parts = []
    if added > 0:
        commit_parts.append(f"agregaron {added} post{'s' if added != 1 else ''}")
    if modified > 0:
        commit_parts.append(f"modificaron {modified} post{'s' if modified != 1 else ''}")
    if deleted > 0:
        commit_parts.append(f"eliminaron {deleted} post{'s' if deleted != 1 else ''} (imágenes limpiadas)")

    commit_message = f"Se {', '.join(commit_parts)} desde Instagram"

    with open('commit_message.txt', 'w', encoding='utf-8') as f:
        f.write(commit_message)

    print(f"Actualizando archivos...")

    # 1. Generar JS Normal
    js_content = "// ========== DATOS DE POSTS DE INSTAGRAM AUTOMATIZADOS ==========\n"
    js_content += f"// Última actualización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    js_content += "const INSTAGRAM_POSTS_DATA = " + json.dumps(new_posts, indent=4, ensure_ascii=False) + ";\n\n"
    js_content += "function getInstagramPostsData() {\n    return INSTAGRAM_POSTS_DATA;\n}"

    with open(JS_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(js_content)

    # 2. Generar MIN.JS
    min_js_content = "const INSTAGRAM_POSTS_DATA=" + json.dumps(new_posts, separators=(',', ':'), ensure_ascii=False) + ";"
    min_js_content += "function getInstagramPostsData(){return INSTAGRAM_POSTS_DATA}"

    with open(MIN_JS_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(min_js_content)

    # 3. Cache busting de los datos en todas las páginas: basta para que los
    #    navegadores (y el Service Worker, que cachea por URL completa) pidan
    #    la versión nueva sin invalidar toda la caché de la PWA.
    version = datetime.now().strftime('%Y-%m-%d_%H%M')
    update_html_versions(version)

    # 4. Solo si cambia el conjunto de imágenes, renovar la caché del Service Worker
    #    para descartar las imágenes que ya no se usan.
    if added > 0 or deleted > 0:
        bump_sw_cache_version(version)

    print(f"Proceso completado. Archivos y variantes de imagen generados.")

def main():
    load_env()
    token = os.getenv('INSTAGRAM_TOKEN')
    if not token:
        print("Error: No se encontró INSTAGRAM_TOKEN. Configúralo como variable de entorno o en el archivo .env")
        sys.exit(1)

    media = fetch_instagram_media(token)
    if media is None:
        print("Error: No se pudieron obtener los posts de Instagram. Revisa el token en INSTAGRAM_TOKEN.")
        sys.exit(1)

    processed = process_posts(media)
    update_files(processed)


if __name__ == "__main__":
    main()
