from app import db, login
from flask_login import UserMixin
import sqlalchemy as sa
from sqlalchemy import String, Boolean, ForeignKey, Date, Numeric, event
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash
from typing import Optional, List
from datetime import datetime, timezone

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))

class User(UserMixin, db.Model):

    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    email: Mapped[str] = mapped_column(String(120), index=True, unique=True)
    password: Mapped[str] = mapped_column(String(256))
    last_login: Mapped[Optional[datetime]] = mapped_column(default=lambda: datetime.now(timezone.utc))

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
class Item(db.Model):

    __tablename__ = 'item'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), index=True)
    rating: Mapped[int] = mapped_column(default=1)


class Shopping_list(db.Model):

    __tablename__ = 'shopping_list'

    id: Mapped[int] = mapped_column(primary_key=True)
    date = mapped_column(Date, default=lambda: datetime.datetime.now())
    name: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    is_marked: Mapped[int] = mapped_column(default=0)

    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), index=True)
    user: Mapped['User'] = relationship()

    items: Mapped[List['Shopping_list_item']] = relationship(cascade="all")


class Shopping_list_item(db.Model):

    __tablename__ = 'shopping_list_item'   

    Shopping_list_id: Mapped[int] = mapped_column(ForeignKey("shopping_list.id"), primary_key=True)
    Shopping_list: Mapped['Shopping_list'] = relationship()

    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"), primary_key=True)
    item: Mapped['Item'] = relationship()

    is_marked: Mapped[int] = mapped_column(default=0)

    quantity = mapped_column(Numeric(15,2), default=1.00)

@event.listens_for(db.session, "after_commit")
def after_commit(session):
    pass
