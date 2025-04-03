from app import create_app, db
from config import Config
app = create_app()

@app.context_processor
def templates_vars():
    return {
        'TITLE': 'Quicklist',
        'CURRENT_VERSION': Config.CURRENT_VERSION,
    }