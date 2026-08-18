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

import json
import os
import re
import sys
from datetime import date, datetime

import requests
from PIL import Image

API_BASE = "https://graph.instagram.com/v21.0"
HASHTAG = "DoubleImpactStoreWeb"
IMAGE_SIZES = (400, 800, 1200)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_SAVED_POSTS = 40


def fail(message):
    print(f"[update_instagram] ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def api_get(path, params):
    params["access_token"] = os.environ["INSTAGRAM_TOKEN"]
    res = requests.get(f"{API_BASE}{path}", params=params, timeout=30)
    if res.status_code != 200:
        raise RuntimeError(f"API HTTP {res.status_code}: {res.text}")
    return res.json()


def get_user_id():
    data = api_get("/me", {"fields": "id,username"})
    return data.get("id"), data.get("username")


def get_hashtag_id(user_id):
    data = api_get(
        "/ig_hashtag_search",
        {"user_id": user_id, "q": HASHTAG},
    )
    if not data.get("data"):
        raise RuntimeError(f"No se encontró el hashtag #{HASHTAG}")
    return data["data"][0]["id"]


def fetch_posts(hashtag_id, user_id):
    data = api_get(
        f"/{hashtag_id}/recent_media",
        {
            "user_id": user_id,
            "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,children{media_url,media_type}",
            "limit": 50,
        },
    )
    posts = data.get("data", [])
    # Sincronizar únicamente los posts con el hashtag requerido
    return [p for p in posts if HASHTAG.lower() in (p.get("caption") or "").lower()]


def pick_media_url(post):
    media_type = post.get("media_type")
    if media_type == "CAROUSEL_ALBUM":
        children = (post.get("children") or {}).get("data") or []
        if children:
            return children[0].get("media_url") or post.get("media_url")
    return post.get("media_url")


def build_title(post):
    caption = (post.get("caption") or "").strip().splitlines()
    if caption:
        return caption[0][:120]
    parsed = datetime.fromisoformat(post.get("timestamp", "").replace("Z", "+00:00"))
    return parsed.strftime("%d/%m/%Y")


def download_image(url, dest_path):
    res = requests.get(url, timeout=60)
    if res.status_code != 200:
        raise RuntimeError(f"No se pudo descargar la imagen (HTTP {res.status_code})")
    with open(dest_path, "wb") as fh:
        fh.write(res.content)


def generate_webp_variants(base_path, sizes=IMAGE_SIZES):
    variants = []
    with Image.open(base_path) as img:
        img = img.convert("RGB")
        for size in sizes:
            thumb = img.copy()
            thumb.thumbnail((size, size))
            out_path = f"{base_path.rsplit('.', 1)[0]}_{size}.webp"
            thumb.save(out_path, "WEBP", quality=82, method=6)
            variants.append(out_path)
    return variants


def build_min_js(posts):
    payload = json.dumps(posts, ensure_ascii=False, separators=(",", ":"))
    header = "// ========== DATOS DE POSTS DE INSTAGRAM AUTOMATIZADOS ==========\n"
    stamp = f"// Última actualización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    body = f"const INSTAGRAM_POSTS_DATA={payload};\n"
    fn = "function getInstagramPostsData(){return INSTAGRAM_POSTS_DATA}\n"
    return header + stamp + "\n" + body + fn


def update_version_in_files(today):
    version = today.strftime("%Y-%m-%d")
    # index.html: query strings ?v=YYYY-MM-DD
    html_path = os.path.join(PROJECT_ROOT, "index.html")
    html = open(html_path, "r", encoding="utf-8").read()
    html = re.sub(r"(\?v=)\d{4}-\d{2}-\d{2}", rf"\g<1>{version}", html)
    open(html_path, "w", encoding="utf-8").write(html)

    # service-worker.js: CACHE_VERSION
    sw_path = os.path.join(PROJECT_ROOT, "service-worker.js")
    sw = open(sw_path, "r", encoding="utf-8").read()
    sw = re.sub(r"(const CACHE_VERSION = )'\d{4}-\d{2}-\d{2}'", rf"\g<1>'{version}'", sw)
    open(sw_path, "w", encoding="utf-8").write(sw)
    return version


def main():
    if "INSTAGRAM_TOKEN" not in os.environ or not os.environ["INSTAGRAM_TOKEN"]:
        fail("Falta la variable de entorno INSTAGRAM_TOKEN. Configúrala como Secret de GitHub.")

    try:
        user_id, username = get_user_id()
        print(f"[update_instagram] Token válido. Usuario: {username} (id {user_id})")
    except Exception as err:
        fail(f"Token de Instagram inválido o expirado: {err}")

    try:
        hashtag_id = get_hashtag_id(user_id)
        posts = fetch_posts(hashtag_id, user_id)
    except Exception as err:
        fail(f"Error consultando la API de Instagram: {err}")

    if not posts:
        print(f"[update_instagram] No hay posts con #{HASHTAG}. Se deja el archivo anterior intacto.")
        return

    processed = []
    img_dir = os.path.join(PROJECT_ROOT, "img")
    os.makedirs(img_dir, exist_ok=True)

    for post in posts[:MAX_SAVED_POSTS]:
        post_id = post.get("id", "")
        media_url = pick_media_url(post)
        if not media_url:
            continue
        base_path = os.path.join(img_dir, f"IG_{post_id}.jpeg")
        try:
            download_image(media_url, base_path)
            generate_webp_variants(base_path)
        except Exception as err:
            print(f"[update_instagram] Advertencia imagen {post_id}: {err}")
            continue

        processed.append(
            {
                "id": f"ig_auto_{post_id}",
                "image": f"img/IG_{post_id}.jpeg",
                "title": build_title(post),
                "description": post.get("caption") or "",
                "link": post.get("permalink") or "",
                "media_type": post.get("media_type") or "",
                "date": (post.get("timestamp") or "")[:10],
                "likes": int(post.get("like_count") or 0),
            }
        )

    if not processed:
        fail("No se pudieron procesar imágenes de los posts.")

    out_path = os.path.join(PROJECT_ROOT, "js", "instagram_posts.min.js")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(build_min_js(processed))

    version = update_version_in_files(date.today())

    print(f"[update_instagram] OK: {len(processed)} posts sincronizados (versión {version}).")


if __name__ == "__main__":
    main()