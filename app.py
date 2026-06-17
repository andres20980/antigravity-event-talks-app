import os
import requests
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Definimos los espacios de nombres del feed Atom
NAMESPACES = {'atom': 'http://www.w3.org/2005/Atom'}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        return jsonify({"error": f"Error al descargar las notas de lanzamiento: {str(e)}"}), 500

    try:
        root = ET.fromstring(response.content)
        entries = []
        for entry_node in root.findall('atom:entry', NAMESPACES):
            title_node = entry_node.find('atom:title', NAMESPACES)
            id_node = entry_node.find('atom:id', NAMESPACES)
            updated_node = entry_node.find('atom:updated', NAMESPACES)
            content_node = entry_node.find('atom:content', NAMESPACES)

            title = title_node.text if title_node is not None else "Sin título"
            entry_id = id_node.text if id_node is not None else ""
            updated = updated_node.text if updated_node is not None else ""
            content = content_node.text if content_node is not None else ""

            # Intentar formatear la fecha a algo más amigable si es posible
            # updated suele ser algo como: 2026-06-15T12:00:00Z
            date_str = updated
            if updated:
                try:
                    # Formato simple: YYYY-MM-DD
                    date_str = updated.split('T')[0]
                except Exception:
                    pass

            entries.append({
                "id": entry_id,
                "title": title,
                "updated": date_str,
                "content": content
            })

        return jsonify({"releases": entries})
    except Exception as e:
        return jsonify({"error": f"Error al procesar el feed de notas de lanzamiento: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
