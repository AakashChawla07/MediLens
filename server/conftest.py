import pytest

from app import app


@pytest.fixture
def client():
    # Flask's test client sends requests straight to the app, so no server needs to be running.
    # The app reads the bundled medilens.db (the data from seed.py); these endpoints only read from it.
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
