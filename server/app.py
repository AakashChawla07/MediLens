import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

# Get the absolute path of the directory where this file is located
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'medilens.db')

from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Association table for BrandedMedicine and Ingredient
branded_medicine_ingredient = db.Table('branded_medicine_ingredient',
    db.Column('branded_medicine_id', db.Integer, db.ForeignKey('branded_medicine.id'), primary_key=True),
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.id'), primary_key=True)
)

class BrandedMedicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    ingredients = db.relationship('Ingredient', secondary=branded_medicine_ingredient, lazy='subquery',
        backref=db.backref('branded_medicines', lazy=True))
    price = db.Column(db.Float, nullable=False)

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

# Association table for GenericMedicine and Ingredient
generic_medicine_ingredient = db.Table('generic_medicine_ingredient',
    db.Column('generic_medicine_id', db.Integer, db.ForeignKey('generic_medicine.id'), primary_key=True),
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.id'), primary_key=True)
)

class GenericMedicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    price = db.Column(db.Float, nullable=False)
    ingredients = db.relationship('Ingredient', secondary=generic_medicine_ingredient, lazy='subquery',
        backref=db.backref('generic_medicines', lazy=True))

def seed_data():
    with app.app_context():
        # Clean up existing data
        db.drop_all()
        db.create_all()

        # Ingredients
        paracetamol = Ingredient(name='Paracetamol')
        ibuprofen = Ingredient(name='Ibuprofen')
        caffeine = Ingredient(name='Caffeine')
        aspirin = Ingredient(name='Aspirin')

        db.session.add_all([paracetamol, ibuprofen, caffeine, aspirin])
        db.session.commit()

        # Branded Medicines
        panadol = BrandedMedicine(name='Panadol', price=10.0)
        panadol.ingredients.append(paracetamol)
        panadol.ingredients.append(caffeine)

        advil = BrandedMedicine(name='Advil', price=12.0)
        advil.ingredients.append(ibuprofen)

        disprin = BrandedMedicine(name='Disprin', price=8.0)
        disprin.ingredients.append(aspirin)

        db.session.add_all([panadol, advil, disprin])
        db.session.commit()

        # Generic Medicines
        generic_paracetamol = GenericMedicine(name='Generic Paracetamol', price=5.0)
        generic_paracetamol.ingredients.append(paracetamol)

        generic_ibuprofen = GenericMedicine(name='Generic Ibuprofen', price=6.0)
        generic_ibuprofen.ingredients.append(ibuprofen)
        
        generic_paracetamol_caffeine = GenericMedicine(name='Generic Paracetamol + Caffeine', price=7.0)
        generic_paracetamol_caffeine.ingredients.append(paracetamol)
        generic_paracetamol_caffeine.ingredients.append(caffeine)

        generic_aspirin = GenericMedicine(name='Generic Aspirin', price=4.0)
        generic_aspirin.ingredients.append(aspirin)
        
        db.session.add_all([generic_paracetamol, generic_ibuprofen, generic_paracetamol_caffeine, generic_aspirin])
        db.session.commit()

        print("Database seeded successfully!")

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    prescriptions = data.get('prescriptions', [])
    user_allergies = [allergy.lower() for allergy in data.get('allergies', [])]

    results = []

    for med_name in prescriptions:
        branded_med = BrandedMedicine.query.filter(BrandedMedicine.name.ilike(med_name)).first()

        if not branded_med:
            results.append({
                'original': med_name,
                'found': False,
                'ingredients': [],
                'generics': [],
                'savings': 0,
                'warnings': []
            })
            continue

        branded_ingredients = {ing.name for ing in branded_med.ingredients}
        
        # Check for allergies
        warnings = []
        conflicting_allergies = [ing for ing in branded_ingredients if ing.lower() in user_allergies]
        if conflicting_allergies:
            warnings.append(f"Conflict: Contains {', '.join(conflicting_allergies)}")

        # Find generic medicines
        generic_alternatives = []
        max_savings = 0
        all_generic_medicines = GenericMedicine.query.all()
        
        for generic_med in all_generic_medicines:
            generic_ingredients = {ing.name for ing in generic_med.ingredients}
            if generic_ingredients == branded_ingredients and generic_med.price < branded_med.price:
                savings = branded_med.price - generic_med.price
                if savings > max_savings:
                    max_savings = savings
                
                generic_alternatives.append({
                    'id': generic_med.id,
                    'name': generic_med.name,
                    'type': 'generic',
                    'price': generic_med.price,
                    'ingredients': list(generic_ingredients),
                    'manufacturer': 'Generic Corp', # Placeholder
                    'description': None
                })
        
        results.append({
            'original': branded_med.name,
            'found': True,
            'ingredients': list(branded_ingredients),
            'generics': generic_alternatives,
            'savings': max_savings,
            'warnings': warnings
        })

    return jsonify({
        'results': results,
        'disclaimer': 'Disclaimer: This platform does not provide medical advice. Please consult a healthcare professional.'
    })

@app.route('/api/medicines/search', methods=['GET'])
def search_medicines():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    
    # Search in BrandedMedicine
    branded = BrandedMedicine.query.filter(BrandedMedicine.name.ilike(f'%{query}%')).all()
    
    results = []
    for med in branded:
        results.append({
            'id': med.id,
            'name': med.name,
            'type': 'branded',
            'price': med.price,
            'ingredients': [ing.name for ing in med.ingredients],
            'manufacturer': 'Branded Corp', # Placeholder
            'description': None
        })
        
    return jsonify(results)


def setup_database():
    with app.app_context():
        if not os.path.exists(db_path):
            print("Creating database and seeding data...")
            db.create_all()
            seed_data()
        else:
            print("Database already exists.")

if __name__ == '__main__':
    setup_database()
    app.run(debug=True, port=5001) # Using a different port to avoid conflicts
