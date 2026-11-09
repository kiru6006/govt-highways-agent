import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.seed import seed_database
from app.seed_official_verification import seed_official_verification
from app.seed_ckicp_tnrsp import seed_ckicp_tnrsp
from app.seed_project_360 import seed_project_360
from app.seed_mock_personas import seed_mock_personas
from app.seed_universal_connectivity import seed_universal_connectivity

# Use in-memory or dedicated test database
TEST_DATABASE_URL = "sqlite:///./test_tn_hdos.db"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db_session=db)
    seed_official_verification(db_session=db)
    seed_ckicp_tnrsp(db_session=db)
    seed_project_360(db_session=db)
    seed_mock_personas(db)
    seed_universal_connectivity(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
