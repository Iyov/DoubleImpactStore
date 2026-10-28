import refresh_instagram_token as rit

TOKEN = 'IGAAviejo123'
NEW_TOKEN = 'IGAAnuevo456'


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload

    def json(self):
        return self._payload


def test_renueva_y_escribe_el_token_sin_imprimirlo(tmp_path, monkeypatch, capsys):
    calls = []

    def fake_get(url, params=None, timeout=None):
        calls.append(params)
        return FakeResponse(200, {'access_token': NEW_TOKEN, 'token_type': 'bearer', 'expires_in': 5183944})

    monkeypatch.setattr(rit.requests, 'get', fake_get)
    monkeypatch.setattr(rit, 'load_env', lambda: None)
    monkeypatch.setenv('INSTAGRAM_TOKEN', TOKEN)
    monkeypatch.delenv('GITHUB_ACTIONS', raising=False)
    out_file = tmp_path / 'token'

    assert rit.main(['script', str(out_file)]) == 0
    assert out_file.read_text(encoding='utf-8') == NEW_TOKEN
    assert calls[0] == {'grant_type': 'ig_refresh_token', 'access_token': TOKEN}
    out = capsys.readouterr().out
    assert NEW_TOKEN not in out and TOKEN not in out
    assert 'Vence en 59 días' in out


def test_en_actions_enmascara_el_token_nuevo(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(
        rit.requests, 'get',
        lambda url, **kwargs: FakeResponse(200, {'access_token': NEW_TOKEN, 'expires_in': 86400}),
    )
    monkeypatch.setattr(rit, 'load_env', lambda: None)
    monkeypatch.setenv('INSTAGRAM_TOKEN', TOKEN)
    monkeypatch.setenv('GITHUB_ACTIONS', 'true')

    assert rit.main(['script', str(tmp_path / 'token')]) == 0
    assert capsys.readouterr().out.startswith(f'::add-mask::{NEW_TOKEN}\n')


def test_token_vencido_falla_sin_escribir(tmp_path, monkeypatch, capsys):
    expired = {'error': {'message': 'Session has expired', 'type': 'OAuthException', 'code': 190}}
    monkeypatch.setattr(rit.requests, 'get', lambda url, **kwargs: FakeResponse(400, expired))
    monkeypatch.setattr(rit, 'load_env', lambda: None)
    monkeypatch.setenv('INSTAGRAM_TOKEN', TOKEN)
    out_file = tmp_path / 'token'

    assert rit.main(['script', str(out_file)]) == 1
    assert not out_file.exists()
    out = capsys.readouterr().out
    assert 'no se pudo renovar' in out and TOKEN not in out


def test_sin_token_falla(tmp_path, monkeypatch):
    monkeypatch.setattr(rit, 'load_env', lambda: None)
    monkeypatch.delenv('INSTAGRAM_TOKEN', raising=False)
    assert rit.main(['script', str(tmp_path / 'token')]) == 1
