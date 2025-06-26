from flask import Flask, request, render_template, jsonify
import pdfplumber
import re
import pandas as pd
import plotly.express as px
import json
from datetime import datetime

app = Flask(__name__)

def extract_data_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        text = page.extract_text()

        # Extract production totals
        lantabur_match = re.search(r'Lantabur Prod. (\d+)', text)
        taqwa_match = re.search(r'Taqwa Prod. (\d+)', text)

        if lantabur_match and taqwa_match:
            lantabur_total = float(lantabur_match.group(1))
            taqwa_total = float(taqwa_match.group(1))

            # Extract tables
            tables = page.extract_tables()
            industry_data = {"Lantabur": [], "Taqwa": []}

            for table in tables:
                industry = None
                for row in table:
                    if row[0]:
                        industry = row[0]
                    if industry in industry_data and row[1]:
                        industry_data[industry].append([row[1], float(row[2])])

            # Convert to DataFrame
            lantabur_df = pd.DataFrame(industry_data["Lantabur"], columns=["Color", "Quantity"])
            taqwa_df = pd.DataFrame(industry_data["Taqwa"], columns=["Color", "Quantity"])

            # Calculate percentage
            lantabur_df["Percentage"] = (lantabur_df["Quantity"] / lantabur_total) * 100
            taqwa_df["Percentage"] = (taqwa_df["Quantity"] / taqwa_total) * 100

            # Create pie charts
            fig1 = px.pie(lantabur_df, names="Color", values="Quantity", title="Lantabur Production by Color")
            fig2 = px.pie(taqwa_df, names="Color", values="Quantity", title="Taqwa Production by Color")

            # Convert figures to JSON
            lantabur_chart = json.loads(fig1.to_json())
            taqwa_chart = json.loads(fig2.to_json())

            return {
                "lantabur_total": lantabur_total,
                "taqwa_total": taqwa_total,
                "lantabur_data": lantabur_df.to_dict(orient="records"),
                "taqwa_data": taqwa_df.to_dict(orient="records"),
                "lantabur_chart": lantabur_chart,
                "taqwa_chart": taqwa_chart,
            }
        else:
            return None

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files["file"]
        if file and file.filename.endswith(".pdf"):
            data = extract_data_from_pdf(file)
            if data:
                return jsonify(data)
            else:
                return jsonify({"error": "Could not find production data in the PDF."}), 400
        else:
            return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)