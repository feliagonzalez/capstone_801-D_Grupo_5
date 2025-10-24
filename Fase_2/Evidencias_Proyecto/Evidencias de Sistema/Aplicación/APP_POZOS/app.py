# app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Habilita CORS para permitir peticiones desde Ionic

# Datos de Pozos (simulando una DB)
POZOS = [
    {"id": 1, "nombre": "Pozo Central 1", "ubicacion": "Lat: -33.4, Lon: -70.6", "caudal": 50.5, "activo": True},
    {"id": 2, "nombre": "Pozo Norte A", "ubicacion": "Lat: -33.3, Lon: -70.5", "caudal": 120.1, "activo": True},
    {"id": 3, "nombre": "Pozo Seco", "ubicacion": "Lat: -33.5, Lon: -70.7", "caudal": 0.0, "activo": False}
]

# Endpoint para obtener todos los pozos
@app.route('/api/pozos', methods=['GET'])
def get_pozos():
    return jsonify(POZOS)

# Endpoint para obtener un pozo específico
@app.route('/api/pozos/<int:pozo_id>', methods=['GET'])
def get_pozo(pozo_id):
    pozo = next((p for p in POZOS if p["id"] == pozo_id), None)
    if pozo:
        return jsonify(pozo)
    return jsonify({"mensaje": "Pozo no encontrado"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)