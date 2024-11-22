from flask import Flask, jsonify, render_template
import json

app = Flask(__name__)

# Load the dataset
with open('static/ships.json') as f:
    ships_data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    return jsonify(ships_data)

if __name__ == '__main__':
    app.run(debug=True)
