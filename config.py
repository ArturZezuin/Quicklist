import os
        
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'jB91FGqbxgfSnF1WUwJXXH6apLF5f9BL'
    CURRENT_VERSION = 5042025-9
