#!/usr/bin/env python3
"""Servidor estático para desarrollo y E2E.

Como `python -m http.server`, pero con una cola de conexiones mayor (la de
http.server es 5 y los E2E en paralelo la desbordan con ECONNREFUSED) y sin
registrar cada petición.

Uso: python scripts/serve.py [puerto]   (por defecto 4173, solo 127.0.0.1)
"""
import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


class Server(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True

    def handle_error(self, request, client_address):
        # El navegador cancela descargas al cerrar una página (p. ej. imágenes lazy)
        if isinstance(sys.exc_info()[1], (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            return
        super().handle_error(request, client_address)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    handler = functools.partial(QuietHandler, directory=ROOT)
    with Server(('127.0.0.1', port), handler) as httpd:
        print(f'Sirviendo {os.path.abspath(ROOT)} en http://127.0.0.1:{port}', flush=True)
        httpd.serve_forever()
