from app import db, login
from flask_login import UserMixin
from sqlalchemy import event
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timezone

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))

@event.listens_for(db.session, "after_commit")
def after_commit(session):
    pass

class User(UserMixin, db.Model):

    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(150), index=True, unique=True)
    password = db.Column(db.String(256))
    last_login = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
class Product(db.Model):

    __tablename__ = 'product'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), index=True)
    rating = db.Column(db.Integer)

    list_items = db.relationship('ShoppinglistItem', backref='product', cascade="all, delete-orphan")

class Shoppinglist(db.Model):

    __tablename__ = 'shopping_list'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime)
    title = db.Column(db.String(100))
    is_marked = db.Column(db.Boolean, index=True, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False) 
    list_items = db.relationship('ShoppinglistItem', backref='shopping_list', cascade="all, delete-orphan")

class ShoppinglistItem(db.Model):

    __tablename__ = 'shopping_list_item'  

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    is_marked = db.Column(db.Integer, index=True, default=0)
    quantity = db.Column(db.Numeric(10,0))

    shopping_list_id = db.Column(db.Integer, db.ForeignKey('shopping_list.id', ondelete='CASCADE'), nullable=False) 
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'), nullable=False)
    

