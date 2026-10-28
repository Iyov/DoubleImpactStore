#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DoubleImpactStore — renovación del token de Instagram
=====================================================
Renueva el token de larga duración (IGAA...) de la API de Instagram con inicio
de sesión de Instagram. Un token renovado vuelve a durar 60 días; solo se puede
renovar mientras siga vigente y tenga al menos 24 horas.

Uso:
    python api/refresh_instagram_token.py <archivo_salida>

Lee INSTAGRAM_TOKEN del entorno (o de .env) y escribe el token nuevo en
<archivo_salida>. Nunca lo imprime: en GitHub Actions emite ::add-mask:: para
que no aparezca en los logs. Sale con código 1 si la renovación falla.
"""

import os
import sys
import requests

from update_instagram import load_env, redact, detect_instagram_error

REFRESH_URL = 'https://graph.instagram.com/refresh_access_token'


def refresh_token(token):
    """Devuelve (token_nuevo, segundos_de_vigencia) o lanza RuntimeError."""
    try:
        response = requests.get(
            REFRESH_URL,
            params={'grant_type': 'ig_refresh_token', 'access_token': token},
            timeout=30,
        )
        data = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise RuntimeError(f"Error al contactar a Instagram: {redact(exc, token)}") from None

    if response.status_code != 200 or 'access_token' not in data:
        message = detect_instagram_error(data)['message']
        raise RuntimeError(redact(message, token))

    return data['access_token'], int(data.get('expires_in', 0))


def main(argv):
    if len(argv) != 2:
        print("Uso: python api/refresh_instagram_token.py <archivo_salida>")
        return 1

    load_env()
    token = os.getenv('INSTAGRAM_TOKEN')
    if not token:
        print("Error: No se encontró INSTAGRAM_TOKEN.")
        return 1

    try:
        new_token, expires_in = refresh_token(token)
    except RuntimeError as exc:
        print(f"Error: no se pudo renovar el token de Instagram. {exc}")
        print("Si el token ya venció, genera uno nuevo en Meta y cárgalo en el secret INSTAGRAM_TOKEN.")
        return 1

    if os.getenv('GITHUB_ACTIONS') == 'true':
        print(f"::add-mask::{new_token}")

    with open(argv[1], 'w', encoding='utf-8') as f:
        f.write(new_token)

    print(f"Token de Instagram renovado. Vence en {expires_in // 86400} días.")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
