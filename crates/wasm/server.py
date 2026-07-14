import os
import http.server
import socketserver

# Automatically lock the working directory to the directory of this script (crates/wasm)
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Force map .wasm files to 'application/wasm' (essential for macOS Python core)
Handler.extensions_map.update({
    '.wasm': 'application/wasm',
    '.js': 'application/javascript',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving Lasinfon v6.1.1 Light Dashboard at http://localhost:8000/www/index.html")
    httpd.serve_forever()
