import json

import pytest
import requests

import update_instagram as ui

TOKEN = 'IGAAsecreto123'


def post(post_id, **overrides):
    data = {
        'id': f'ig_auto_{post_id}',
        'image': f'img/IG_{post_id}.jpeg',
        'title': f'Post {post_id}',
        'description': 'Descripción',
        'link': f'https://www.instagram.com/p/{post_id}/',
        'media_type': 'IMAGE',
        'date': '2026-10-01',
        'likes': 10,
    }
    data.update(overrides)
    return data


def test_cambio_solo_de_likes_no_es_significativo():
    old = [post('1'), post('2')]
    new = [post('1', likes=11), post('2', likes=99)]
    assert ui.calculate_changes(old, new) == (0, 0, 0)
    assert not ui.posts_have_changed(old, new)


@pytest.mark.parametrize('field', ui.SIGNIFICANT_FIELDS)
def test_cambio_en_campo_significativo(field):
    old = [post('1')]
    new = [post('1', **{field: 'otro valor'})]
    assert ui.calculate_changes(old, new) == (0, 1, 0)
    assert ui.posts_have_changed(old, new)


def test_agregados_y_eliminados():
    old = [post('1'), post('2')]
    new = [post('2'), post('3'), post('4')]
    assert ui.calculate_changes(old, new) == (2, 0, 1)


def test_redact_oculta_el_token():
    assert ui.redact(f'https://x/?access_token={TOKEN}', TOKEN) == 'https://x/?access_token=***'
    assert ui.redact('sin token', None) == 'sin token'


def test_error_de_red_no_imprime_el_token(monkeypatch, capsys):
    def fail(url, **kwargs):
        raise requests.ConnectionError(f'Max retries exceeded with url: /me/media?access_token={TOKEN}')

    monkeypatch.setattr(ui.requests, 'get', fail)
    assert ui.fetch_instagram_media(TOKEN) is None
    out = capsys.readouterr().out
    assert TOKEN not in out
    assert '***' in out


@pytest.fixture
def site(tmp_path, monkeypatch):
    """Sitio mínimo en un directorio temporal con datos de Instagram existentes."""
    monkeypatch.chdir(tmp_path)
    (tmp_path / 'js').mkdir()
    (tmp_path / 'img').mkdir()
    existing = [post('1'), post('2')]
    (tmp_path / 'js' / 'instagram_posts.js').write_text(
        'const INSTAGRAM_POSTS_DATA = ' + json.dumps(existing, indent=4) + ';\n', encoding='utf-8'
    )
    for page in ('index.html', 'productos.html', '404.html'):
        (tmp_path / page).write_text('<script src="js/instagram_posts.min.js?v=viejo"></script>', encoding='utf-8')
    (tmp_path / 'service-worker.js').write_text("const CACHE_VERSION = 'viejo';\n", encoding='utf-8')
    return tmp_path, existing


def test_solo_likes_no_escribe_nada(site):
    root, existing = site
    ui.update_files([dict(p, likes=500) for p in existing])
    assert not (root / 'commit_message.txt').exists()
    assert not (root / 'js' / 'instagram_posts.min.js').exists()
    assert 'v=viejo' in (root / 'index.html').read_text(encoding='utf-8')


def test_modificacion_actualiza_todas_las_paginas_sin_tocar_el_sw(site):
    root, existing = site
    ui.update_files([existing[0], dict(existing[1], title='Nuevo título')])
    assert (root / 'commit_message.txt').read_text(encoding='utf-8') == 'Se modificaron 1 post desde Instagram'
    for page in ('index.html', 'productos.html', '404.html'):
        html = (root / page).read_text(encoding='utf-8')
        assert 'v=viejo' not in html and 'instagram_posts.min.js?v=' in html
    assert "CACHE_VERSION = 'viejo'" in (root / 'service-worker.js').read_text(encoding='utf-8')
    assert 'Nuevo título' in (root / 'js' / 'instagram_posts.min.js').read_text(encoding='utf-8')


def test_post_agregado_renueva_la_cache_del_sw(site):
    root, existing = site
    ui.update_files(existing + [post('3')])
    assert "CACHE_VERSION = 'viejo'" not in (root / 'service-worker.js').read_text(encoding='utf-8')
    assert (root / 'commit_message.txt').read_text(encoding='utf-8') == 'Se agregaron 1 post desde Instagram'


def test_descarga_fallida_omite_el_post(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    (tmp_path / 'img').mkdir()

    class NotFound:
        status_code = 404

    monkeypatch.setattr(ui.requests, 'get', lambda url, **kwargs: NotFound())
    media = [{
        'id': '9', 'caption': 'Título\n#DoubleImpactStoreWeb', 'media_type': 'IMAGE',
        'media_url': 'https://cdn/x.jpg', 'permalink': 'https://www.instagram.com/p/9/',
        'timestamp': '2026-10-01T00:00:00+0000',
    }]
    assert ui.process_posts(media) == []
