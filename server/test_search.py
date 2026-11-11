import pytest


def search(client, query):
    response = client.get('/api/medicines/search', query_string={'q': query})
    assert response.status_code == 200
    return response.get_json()


def test_search_finds_branded_medicine_by_partial_name(client):
    results = search(client, 'lip')

    assert [m['name'] for m in results] == ['Lipitor']
    assert results[0]['type'] == 'branded'
    assert results[0]['price'] == 60.0
    assert results[0]['ingredients'] == ['Atorvastatin']


def test_search_is_case_insensitive(client):
    assert [m['name'] for m in search(client, 'ZYR')] == ['Zyrtec']


def test_search_with_empty_query_returns_nothing(client):
    assert search(client, '') == []


def test_search_with_no_match_returns_nothing(client):
    assert search(client, 'xyz') == []


@pytest.mark.xfail(strict=True, reason='search only matches brand names, not active ingredients yet')
def test_search_finds_medicine_by_active_ingredient(client):
    # The old manual script expected 'amox' to find Augmentin (which contains Amoxicillin)
    assert 'Augmentin' in [m['name'] for m in search(client, 'amox')]
