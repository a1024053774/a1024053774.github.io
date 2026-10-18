"""Serve the built site for concurrent browser tests, without a five-connection backlog."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class ReadingServer(ThreadingHTTPServer):
    request_queue_size = 128


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', default='_site')
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    with ReadingServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=args.site)) as server:
        server.serve_forever()
