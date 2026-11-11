import pytest


def analyze(client, prescriptions, allergies=None):
    response = client.post('/api/analyze', json={
        'prescriptions': prescriptions,
        'allergies': allergies or [],
    })
    assert response.status_code == 200
    return response.get_json()


def test_analyze_includes_disclaimer(client):
    data = analyze(client, ['Panadol'])

    assert 'does not provide medical advice' in data['disclaimer']


def test_analyze_returns_one_result_per_prescription_in_order(client):
    data = analyze(client, ['Panadol', 'Advil', 'Lipitor'])

    assert [r['original'] for r in data['results']] == ['Panadol', 'Advil', 'Lipitor']


def test_analyze_matches_medicine_name_case_insensitively(client):
    result = analyze(client, ['advil'])['results'][0]

    assert result['found'] is True
    assert result['original'] == 'Advil'


@pytest.mark.parametrize('brand, generic, savings', [
    ('Advil', 'Generic Ibuprofen', 8.0),
    ('Lipitor', 'Generic Atorvastatin', 48.0),
    ('Augmentin', 'Generic Amoxicillin', 30.0),
])
def test_analyze_finds_cheaper_generic_and_savings(client, brand, generic, savings):
    result = analyze(client, [brand])['results'][0]

    assert [g['name'] for g in result['generics']] == [generic]
    assert result['savings'] == savings


def test_analyze_only_suggests_generics_with_the_same_ingredients(client):
    # Panadol is Paracetamol + Caffeine, so plain Generic Paracetamol is not a substitute
    result = analyze(client, ['Panadol'])['results'][0]

    assert sorted(result['ingredients']) == ['Caffeine', 'Paracetamol']
    assert [g['name'] for g in result['generics']] == ['Generic Paracetamol + Caffeine']


def test_analyze_warns_about_allergy_conflicts_case_insensitively(client):
    result = analyze(client, ['Panadol'], allergies=['caffeine'])['results'][0]

    assert result['warnings'] == ['Conflict: Contains Caffeine']


def test_analyze_only_warns_for_medicines_that_contain_the_allergen(client):
    results = analyze(client, ['Augmentin', 'Lipitor'], allergies=['Amoxicillin'])['results']

    assert results[0]['warnings'] == ['Conflict: Contains Amoxicillin']
    assert results[1]['warnings'] == []


def test_analyze_reports_unknown_medicine_as_not_found(client):
    result = analyze(client, ['Crocin'])['results'][0]

    assert result['original'] == 'Crocin'
    assert result['found'] is False
    assert result['generics'] == []
    assert result['savings'] == 0
    assert result['warnings'] == []
