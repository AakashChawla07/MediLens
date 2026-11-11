# MediLens
An medicine information tool which helps people to know about generic substitutes of expensive branded medicines.

# 🩺MediLens – Medicine Cost Transparency & Allergy Awareness Platform
Empowering patients with clarity, affordability, and safety — without replacing medical expertise
## 🚀 Overview
Healthcare is expensive — and patients often end up paying for overpriced branded medicines, even when equally effective generics exist. Many also lack awareness about potential allergy risks related to prescribed drugs.

## MediLens is a backend‑driven platform that helps patients:

### Upload or enter their prescription

### Identify prescribed medicines

### Find cheaper generic alternatives with identical active ingredients

### View price comparisons & potential savings

### Detect possible allergy conflicts

### Receive a clean, explainable report

## ⚠️ Important: MediLens does NOT recommend treatment or replace doctors.
It only provides transparency & information to help patients make informed discussions with healthcare professionals.

# 🎯 Key Features
### Medicine Intelligence
Maps branded medicines → active chemical ingredients

Finds generics with identical compositions

Displays dosage composition details

### Price Transparency
Shows price difference between brand & generic

Calculates potential savings

Highlights most economical safe options

### Allergy Awareness
Users submit known allergies

System checks ingredient conflicts

Flags risky medicines clearly

### Clean & Responsible Output
Human‑readable explanations

Safety disclaimers

Zero misleading recommendations

# 🧪 Running Tests
The Flask API has automated tests written with pytest. They use Flask's test client and the bundled SQLite database (`server/medilens.db`), so no server needs to be running.

```bash
pip install -r requirements-dev.txt
python -m pytest server
```
