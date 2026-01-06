"""
Live Dashboard for Enterprise Results
- Displays real estate intelligence outputs, consensus, and sentiment
"""
import pandas as pd
from flask import Flask, render_template_string

app = Flask(__name__)

@app.route('/')
def index():
    try:
        df = pd.read_csv('../output/enterprise_results.csv')
    except Exception:
        df = pd.DataFrame()
    html = df.to_html() if not df.empty else '<h2>No results available.</h2>'
    return render_template_string(f'<h1>Enterprise Results Dashboard</h1>{html}')

if __name__ == '__main__':
    app.run(port=4000)
