from app import app, db, BrandedMedicine, Ingredient, GenericMedicine

def seed_data():
    with app.app_context():
        # Clean up existing data
        db.drop_all()
        db.create_all()

        # --- Ingredients ---
        ingredients = {
            'Paracetamol': Ingredient(name='Paracetamol'),
            'Ibuprofen': Ingredient(name='Ibuprofen'),
            'Caffeine': Ingredient(name='Caffeine'),
            'Aspirin': Ingredient(name='Aspirin'),
            'Amoxicillin': Ingredient(name='Amoxicillin'),
            'Atorvastatin': Ingredient(name='Atorvastatin'),
            'Metformin': Ingredient(name='Metformin'),
            'Omeprazole': Ingredient(name='Omeprazole'),
            'Lisinopril': Ingredient(name='Lisinopril'),
            'Amlodipine': Ingredient(name='Amlodipine'),
            'Cetirizine': Ingredient(name='Cetirizine'),
            'Azithromycin': Ingredient(name='Azithromycin'),
        }
        
        db.session.add_all(ingredients.values())
        db.session.commit()

        # Helper to get ingredients
        def get_ings(names):
            return [ingredients[n] for n in names]

        # --- Branded Medicines ---
        branded_meds = [
            # Painkillers
            {'name': 'Panadol', 'price': 10.0, 'ings': ['Paracetamol', 'Caffeine']},
            {'name': 'Advil', 'price': 12.0, 'ings': ['Ibuprofen']},
            {'name': 'Disprin', 'price': 8.0, 'ings': ['Aspirin']},
            {'name': 'Tylenol', 'price': 11.0, 'ings': ['Paracetamol']},
            
            # Antibiotics
            {'name': 'Augmentin', 'price': 45.0, 'ings': ['Amoxicillin']}, # Simplified
            {'name': 'Zithromax', 'price': 50.0, 'ings': ['Azithromycin']},
            
            # Cholesterol
            {'name': 'Lipitor', 'price': 60.0, 'ings': ['Atorvastatin']},
            
            # Diabetes
            {'name': 'Glucophage', 'price': 25.0, 'ings': ['Metformin']},
            
            # Acid Reflux
            {'name': 'Prilosec', 'price': 30.0, 'ings': ['Omeprazole']},
            
            # Blood Pressure
            {'name': 'Zestril', 'price': 20.0, 'ings': ['Lisinopril']},
            {'name': 'Norvasc', 'price': 22.0, 'ings': ['Amlodipine']},
            
            # Allergies
            {'name': 'Zyrtec', 'price': 18.0, 'ings': ['Cetirizine']},
        ]

        for m in branded_meds:
            med = BrandedMedicine(name=m['name'], price=m['price'])
            med.ingredients.extend(get_ings(m['ings']))
            db.session.add(med)

        # --- Generic Medicines ---
        generic_meds = [
            # Painkillers
            {'name': 'Generic Paracetamol', 'price': 3.0, 'ings': ['Paracetamol']},
            {'name': 'Generic Ibuprofen', 'price': 4.0, 'ings': ['Ibuprofen']},
            {'name': 'Generic Aspirin', 'price': 2.0, 'ings': ['Aspirin']},
            {'name': 'Generic Paracetamol + Caffeine', 'price': 5.0, 'ings': ['Paracetamol', 'Caffeine']},
            
            # Antibiotics
            {'name': 'Generic Amoxicillin', 'price': 15.0, 'ings': ['Amoxicillin']},
            {'name': 'Generic Azithromycin', 'price': 18.0, 'ings': ['Azithromycin']},
            
            # Cholesterol
            {'name': 'Generic Atorvastatin', 'price': 12.0, 'ings': ['Atorvastatin']},
            
            # Diabetes
            {'name': 'Generic Metformin', 'price': 8.0, 'ings': ['Metformin']},
            
            # Acid Reflux
            {'name': 'Generic Omeprazole', 'price': 10.0, 'ings': ['Omeprazole']},
            
            # Blood Pressure
            {'name': 'Generic Lisinopril', 'price': 5.0, 'ings': ['Lisinopril']},
            {'name': 'Generic Amlodipine', 'price': 6.0, 'ings': ['Amlodipine']},
            
            # Allergies
            {'name': 'Generic Cetirizine', 'price': 5.0, 'ings': ['Cetirizine']},
        ]

        for m in generic_meds:
            med = GenericMedicine(name=m['name'], price=m['price'])
            med.ingredients.extend(get_ings(m['ings']))
            db.session.add(med)

        db.session.commit()
        print("Database seeded successfully with expanded data!")

if __name__ == '__main__':
    seed_data()
