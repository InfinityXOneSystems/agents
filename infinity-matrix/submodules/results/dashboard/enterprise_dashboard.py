"""
Enterprise Dashboard (Futuristic, Glassmorphic)
- Visualizes all enterprise results in a modern, glassmorphic UI
- Uses Flask + modern HTML/CSS (with glassmorphism)
- Auto-loads and updates results from /output
"""
import os
import pandas as pd
from flask import Flask, render_template_string

app = Flask(__name__)

ENTERPRISE_RESULTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output/enterprise_results.csv')

def load_results():
    if os.path.exists(ENTERPRISE_RESULTS):
        df = pd.read_csv(ENTERPRISE_RESULTS)
        return df
    return pd.DataFrame()

glass_css = '''
body {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
  font-family: 'Segoe UI', Arial, sans-serif;
  margin: 0;
  padding: 0;
}
.dashboard-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 32px;
  background: rgba(255,255,255,0.12);
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.18);
}
h1 {
  color: #fff;
  text-align: center;
  font-size: 2.8rem;
  letter-spacing: 2px;
  margin-bottom: 32px;
  text-shadow: 0 2px 8px #0008;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255,255,255,0.18);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(31,38,135,0.17);
}
th, td {
  padding: 16px 12px;
  text-align: left;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
th {
  background: rgba(44,83,100,0.7);
  font-size: 1.1rem;
  letter-spacing: 1px;
}
tr:last-child td {
  border-bottom: none;
}
tr:hover {
  background: rgba(255,255,255,0.08);
  transition: background 0.2s;
}
::-webkit-scrollbar {
  width: 8px;
  background: rgba(44,83,100,0.2);
}
::-webkit-scrollbar-thumb {
  background: rgba(44,83,100,0.5);
  border-radius: 8px;
}
'''

@app.route('/')
def dashboard():
    df = load_results()
    if df.empty:
        table_html = '<h2>No enterprise results available.</h2>'
    else:
        table_html = df.to_html(classes='table', index=False, border=0, escape=False)
    html = f'''
    <html>
    <head>
        <title>Enterprise Intelligence Dashboard</title>
        <style>{glass_css}</style>
    </head>
    <body>
        <div class="dashboard-container">
            <h1>Enterprise Intelligence Dashboard</h1>
            {table_html}
        </div>
    </body>
    </html>
    '''
    return render_template_string(html)

if __name__ == '__main__':
    app.run(port=4001, debug=True)
