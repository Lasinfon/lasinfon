import os
import http.server
import socketserver

# Automatically locate and serve the 'crates/wasm/www' directory directly as the root of port 8000
script_dir = os.path.dirname(os.path.abspath(__file__))
serving_dir = os.path.join(script_dir, 'www')
os.chdir(serving_dir)

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Force map correct MIME types (essential for macOS Python core)
Handler.extensions_map.update({
    '.wasm': 'application/wasm',
    '.js': 'application/javascript',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving Lasinfon v6.1.1 on http://localhost:8000")
    httpd.serve_forever()
