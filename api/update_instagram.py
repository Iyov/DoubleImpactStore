#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DoubleImpactStore — Instagram_Updater
====================================
Sincroniza los posts de Instagram con el hashtag #DoubleImpactStoreWeb
y genera las variantes WebP (400/800/1200) usando Pillow.

Requisitos de entorno:
    INSTAGRAM_TOKEN  -> Token de acceso de Instagram Graph API (Business/Messenger).
                         NO debe versionarse. Configúralo como Secret de GitHub.

Salidas:
    - js/instagram_posts.min.js       (datos de posts)
    - img/IG_<id>.jpeg + variantes _400/_800/_1200.webp
    - Actualiza la versión (?v=YYYY-MM-DD) en index.html y el CACHE_VERSION
      en service-worker.js

Si el token es inválido/expirado, termina con código de salida 1.
"""

import os
import sys
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

# Intentar leer .env localmente si existe
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

# CONFIGURACIÓN
ACCESS_TOKEN = os.getenv('INSTAGRAM_TOKEN')
HASHTAG_FILTER = '#DoubleImpactStoreWeb'
JS_FILE_PATH = 'js/instagram_posts.js'
MIN_JS_FILE_PATH = 'js/instagram_posts.min.js'
INDEX_FILE_PATH = 'index.html'
SW_FILE_PATH = 'service-worker.js'
IMAGE_DIR = 'img/'
MAX_POSTS = 1000  # Número máximo de posts a obtener

def fetch_instagram_media():
    """Obtiene los posts recientes del usuario con paginación."""
    all_media = []
    url = f"https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,children{{media_url,media_type}}&limit=25&access_token={ACCESS_TOKEN}"

    while url and len(all_media) < MAX_POSTS:
        try:
            response = requests.get(url, timeout=30)
        except requests.RequestException as exc:
            print(f"Error de red al conectar con Instagram: {exc}")
            return None

        if response.status_code != 200:
            error_payload = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            error_info = detect_instagram_error(error_payload)
            print(f"Error al conectar con Instagram: {response.text}")
            print(error_info['message'])
            return None

        data = response.json()
        if 'error' in data:
            error_info = detect_instagram_error(data)
            print(f"Error al conectar con Instagram: {json.dumps(data, ensure_ascii=False)}")
            print(error_info['message'])
            return None

        all_media.extend(data.get('data', []))

        # Obtener la siguiente página si existe
        url = data.get('paging', {}).get('next')

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
    """Descarga la imagen original y genera sus variantes optimizadas solo si no existen."""
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
    response = requests.get(url)
    if response.status_code == 200:
        with open(temp_path, 'wb') as f:
            f.write(response.content)
        
        # Guardar una copia como JPEG original por si acaso (tu JS la usa como fallback)
        with Image.open(temp_path) as img:
            img.convert("RGB").save(final_path, "JPEG", quality=90)
            
        # Generar los WebP optimizados
        process_image_variants(temp_path, post_id)
        
        # Borrar el temporal
        os.remove(temp_path)
        print(f"Imagen e imágenes WebP procesadas para: {post_id}")
    else:
        print(f"Error al descargar imagen {post_id}")
        
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

def calculate_changes(old_posts, new_posts):
    """Calcula los cambios entre posts antiguos y nuevos."""
    old_ids = {post['id'] for post in old_posts}
    new_ids = {post['id'] for post in new_posts}
    
    added = len(new_ids - old_ids)
    deleted = len(old_ids - new_ids)
    
    # Calcular modificados (posts que existen en ambos pero con contenido diferente)
    modified = 0
    common_ids = old_ids & new_ids
    
    old_posts_dict = {post['id']: post for post in old_posts}
    new_posts_dict = {post['id']: post for post in new_posts}
    
    for post_id in common_ids:
        old_post = old_posts_dict[post_id]
        new_post = new_posts_dict[post_id]
        
        if (old_post['title'] != new_post['title'] or 
            old_post['description'] != new_post['description'] or
            old_post['image'] != new_post['image'] or
            old_post['link'] != new_post['link'] or
            old_post.get('likes') != new_post.get('likes')):
            modified += 1
    
    return added, modified, deleted

def posts_have_changed(old_posts, new_posts):
    """Compara los posts para detectar cambios significativos."""
    if len(old_posts) != len(new_posts):
        return True
    
    # Crear sets de IDs para comparación rápida
    old_ids = {post['id'] for post in old_posts}
    new_ids = {post['id'] for post in new_posts}
    
    if old_ids != new_ids:
        return True
    
    # Comparar contenido de cada post (sin la fecha de actualización)
    for old_post, new_post in zip(sorted(old_posts, key=lambda x: x['id']), 
                                   sorted(new_posts, key=lambda x: x['id'])):
        if (old_post['title'] != new_post['title'] or 
            old_post['description'] != new_post['description'] or
            old_post['image'] != new_post['image'] or
            old_post['link'] != new_post['link'] or
            old_post.get('likes') != new_post.get('likes')):
            return True
    
    return False

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


def update_files(new_posts):
    """Actualiza los archivos JS, MIN.JS, INDEX.HTML y SERVICE-WORKER.JS solo si hay cambios."""
    if not new_posts:
        print("No se encontraron posts nuevos con el hashtag.")
        return

    # Cargar posts existentes y comparar
    existing_posts = load_existing_posts()
    
    if not posts_have_changed(existing_posts, new_posts):
        print("No hay cambios en los posts de Instagram. No se requiere actualización.")
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

    # 3. Actualizar Index.html
    new_version = datetime.now().strftime('%Y-%m-%d_%H%M')
    if os.path.exists(INDEX_FILE_PATH):
        with open(INDEX_FILE_PATH, 'r', encoding='utf-8') as f:
            html = f.read()
        pattern = r"instagram_posts\.min\.js\?v=[^\"']+"
        replacement = f"instagram_posts.min.js?v={new_version}"
        new_html = re.sub(pattern, replacement, html)
        with open(INDEX_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_html)

    # 4. Actualizar Service Worker con TODAS las variantes WebP
    if os.path.exists(SW_FILE_PATH):
        with open(SW_FILE_PATH, 'r', encoding='utf-8') as f:
            sw_content = f.read()
        
        sw_version = datetime.now().strftime('%Y-%m-%d_%H%M')
        sw_content = re.sub(r"const CACHE_VERSION = '[^']+';", f"const CACHE_VERSION = '{sw_version}';", sw_content)
        
        # Generar lista extendida de imágenes (JPEG + todas las variantes WebP)
        full_images_list = []
        for p in new_posts:
            base_id = p['image'].split('/')[-1].replace('.jpeg', '')
            full_images_list.append(f"    '/img/{base_id}.jpeg'")
            full_images_list.append(f"    '/img/{base_id}_400.webp'")
            full_images_list.append(f"    '/img/{base_id}_800.webp'")
            full_images_list.append(f"    '/img/{base_id}_1200.webp'")
        
        new_images_js = "const INSTAGRAM_IMAGES = [\n" + ",\n".join(full_images_list) + "\n];"
        sw_content = re.sub(r"const INSTAGRAM_IMAGES = \[.*?\];", new_images_js, sw_content, flags=re.DOTALL)
        
        with open(SW_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(sw_content)
        print(f"Service Worker actualizado con variantes WebP")

    print(f"Proceso completado. Archivos y variantes de imagen generados.")

if __name__ == "__main__":
    if not ACCESS_TOKEN:
        print("Error: No se encontró INSTAGRAM_TOKEN. Configúralo como variable de entorno o en el archivo .env")
        sys.exit(1)

    media = fetch_instagram_media()
    if media is None:
        print("Error: No se pudieron obtener los posts de Instagram. Revisa el token en INSTAGRAM_TOKEN.")
        sys.exit(1)

    processed = process_posts(media)
    update_files(processed)
