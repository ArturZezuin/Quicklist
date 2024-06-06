from app import db, models as m
from app.main import bp

from flask import render_template ,redirect, url_for, request
from flask_login import login_required, current_user

import sqlalchemy as sa
from flask import jsonify

from datetime import datetime, timezone

@bp.before_app_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_login = datetime.now(timezone.utc)
        db.session.commit()

@bp.route('/')
@bp.route('/index')
@login_required
def index():
    lists = m.Shopping_list.query.filter_by(user_id=current_user.id).order_by('is_marked').order_by(sa.desc('id')).all()
    return render_template('main/main.html', lists=lists)

@bp.route('/add_list')
@login_required
def add_list():
    new_list = m.Shopping_list(name='New list', date=datetime.now(), user_id=current_user.id)
    db.session.add(new_list)
    db.session.commit()
    return render_template('main/edit.html', cur_list=new_list)

@bp.get('/change_list_name/<int:id>/<string:name>')
def change_list_name(id, name):
    cur_list = m.Shopping_list.query.get_or_404(id)
    cur_list.name = name
    db.session.commit()
    return '1'


@bp.get('/delete_list/<int:id>')
@login_required
def delete_list(id):
    cur_list = m.Shopping_list.query.get_or_404(id)
    try:
        db.session.delete(cur_list)
        db.session.commit()
        return '1'
    except:
        return '0'

@bp.route('/list/<int:id>', methods=['GET', 'POST'])
@login_required
def list(id):
    cur_list = m.Shopping_list.query.order_by('is_marked').get_or_404(id)
    return render_template('main/edit.html', cur_list=cur_list)

@bp.route('/searchitem/<string:strs>', methods=['GET'])
@login_required
def searchitem(strs):

    found_items = m.Item.query.filter(m.Item.name.ilike(f'%{strs.lower()}%')).limit(10).all()
    list_items = []
    for item in found_items:
        list_items.append([item.id, item.name])

    return list_items

@bp.get('/add_item/<string:strs>')
@login_required
def additem(strs):

    new_item_name = strs.lower()
    found_items = m.Item.query.filter_by(name=new_item_name).first()
    if found_items is None:
        new_item = m.Item(name=new_item_name)
        db.session.add(new_item)
        db.session.commit()
        return {'itemId': new_item.id}
    
    return {'itemId': found_items.id}

@bp.get('/delete_list_item/<int:id_list>/<int:id_item>')
@login_required
def delete_list_item(id_list, id_item):
    cur_item_list = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, item_id=id_item).first()
    if cur_item_list is not None:
        db.session.delete(cur_item_list)
        db.session.commit()
        return {'is_delete': 1}
    
    return {'is_delete': 0}

@bp.get('/mark_list_item/<int:id_list>/<int:id_item>/<int:is_marked>')
@login_required
def mark_list_item(id_list, id_item, is_marked):
    cur_item_list = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, item_id=id_item).first()
    if cur_item_list is not None:
        cur_item_list.is_marked = is_marked
        db.session.flush()

        cur_list = m.Shopping_list.query.filter_by(id=id_list).first()
        not_marked_item = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, is_marked=0).first()
        if not_marked_item is None:
            cur_list.is_marked = 1 
        else:
            cur_list.is_marked = 0 
            
        db.session.commit() 
        return {'change_marked': 1}
    
    return {'change_marked': 0}

@bp.get('/add_list_item/<int:id_list>/<int:id_item>')
@login_required
def add_list_item(id_list, id_item):

    found_items = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, item_id=id_item).first()
    if found_items is None:
        new_item = m.Shopping_list_item(Shopping_list_id=id_list, item_id=id_item)
        db.session.add(new_item)
        rating_item = m.Item.query.filter_by(id=id_item).first()
        rating_item.rating += 1
        db.session.commit()
        return {'is_add': '1'}
    
    return {'is_add': '0'}
    