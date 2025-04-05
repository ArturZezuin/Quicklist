from app.models import Shoppinglist, ShoppinglistItem, Product

from app import db
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
    try:
        
        lists = Shoppinglist.query.filter(
            Shoppinglist.user_id == current_user.id
        ).outerjoin(ShoppinglistItem, ShoppinglistItem.shopping_list_id == Shoppinglist.id 
        ).with_entities(
            Shoppinglist,
            sa.func.count(ShoppinglistItem.id).label('item_count') 
        ).group_by(
            Shoppinglist.id
        ).order_by(
            Shoppinglist.is_marked,
            sa.desc(Shoppinglist.id) 
        ).all()

        return render_template('main/main.html', lists=lists)
    
    except Exception as e:
        return render_template('errors/500.html', err=e)
    
@bp.get('/list/<int:id>')
@login_required
def list(id):
    try:
        shopping_list = Shoppinglist.query.filter(
            Shoppinglist.user_id  == current_user.id,
            Shoppinglist.id == id,  
        ).order_by('is_marked').first_or_404()

        return render_template('main/edit.html', shopping_list=shopping_list)
    
    except Exception as e:
        return render_template('errors/500.html', err=e)
    
@bp.post('/addlist')
@login_required
def addlist():
    try:
        new_title = request.form.get('title')
        new_list = Shoppinglist(title=new_title, date=datetime.now(), user_id=current_user.id)
        db.session.add(new_list)
        db.session.commit()

        #return render_template('main/edit.html', shopping_list=new_list)
        return redirect(url_for('main.list', id=new_list.id))

    except Exception as e:
        return render_template('errors/500.html', err=e)

@bp.patch('/updatelistname')
@login_required
def updatelistname():
    try:
        data = request.get_json()
        id = data.get('id')
        name = data.get('name')
        f_list = Shoppinglist.query.filter(
            Shoppinglist.user_id == current_user.id,
            Shoppinglist.id == id,
        ).first()

        if f_list:
            f_list.title = name
            db.session.commit()
            return jsonify({"message": "Name updated successfully"}), 200 
        
    except Exception as e:
        return jsonify({"Err (updateLIstName)": e}), 200
    
@bp.delete('/deletelist')
@login_required
def deletelist():

    data = request.get_json()
    id = data.get('id')
    if not id:
        return jsonify({"message": "ID not provided"}), 400

    try:
        f_list = Shoppinglist.query.filter(
            Shoppinglist.user_id == current_user.id, 
        Shoppinglist.id == id, 
        ).order_by(
            Shoppinglist.title    
        ).first()
        db.session.delete(f_list)
        db.session.commit()
        return jsonify({"message": "List deleted successfully"}), 200
    
    except Exception as e:
        return render_template('errors/500.html', err=e)


@bp.post('/searchproduct')
@login_required
def searchproduct():
    try:
        data = request.get_json()
        title = data.get('title')
        f_products = []
        if title:
            f_products = Product.query.filter(
                Product.title.like(f'%{title.lower()}%')
            ).limit(20).all()

        result_list = [{
            "id": item.id,
            "title": item.title,
        } for item in f_products]

        return jsonify(result_list), 200

    except Exception as e:
        return jsonify({'Err (searchproduct)': e}), 404
    

@bp.post('/addlistitem')
@login_required
def addlistitem():

    data = request.get_json()
    id_list = data.get('id_list')
    id_product = data.get('id_product')
    title = data.get('title')

    try:
        if id_product == 0:
            new_product = Product(
                title = title.lower()
            )
            db.session.add(new_product)
            db.session.commit()

            id_product = new_product.id
        
        f_list_item = ShoppinglistItem.query.filter(
            ShoppinglistItem.shopping_list_id ==  id_list,
            ShoppinglistItem.product_id == id_product,  
        ).first()

        if f_list_item:
            f_list_item.quantity += 1
            c_list_item = f_list_item
            db.session.commit()
        else:
            new_list_item = ShoppinglistItem(
                shopping_list_id =  id_list,
                product_id = id_product, 
                quantity = 1,   
            )
            db.session.add(new_list_item)
            db.session.commit()
            c_list_item = new_list_item

        return jsonify({'list_item_id':c_list_item.id, 'id_product': id_product}), 200

    except Exception as e:
        return jsonify({'Err (addlistitem)': e}), 404
    
@bp.patch('/marklistitem')
@login_required
def marklistitem():
    try:    
        data = request.get_json()
        id = data.get('id')
        marker = data.get('marker')
        if id:
            f_list_item = ShoppinglistItem.query.filter(
                ShoppinglistItem.id == int(id)    
            ).first()

            if f_list_item:
                f_list_item.is_marked = marker
                db.session.commit()

        return jsonify('OK'), 200

    except Exception as e:
        return jsonify({'Err (addlistitem)': e}), 404


@bp.delete('/deletelistitem')
@login_required
def deletelistitem():
    try:    
        id = request.get_json()
        if id:
            f_list_item = ShoppinglistItem.query.filter(
                ShoppinglistItem.id == int(id)    
            ).first()

            if f_list_item:
                db.session.delete(f_list_item)
                db.session.commit()

        return jsonify('OK'), 200

    except Exception as e:
        return jsonify({'Err (addlistitem)': e}), 404

    
# @bp.get('/add_item/<string:strs>')
# @login_required
# def additem(strs):

#     new_item_name = strs.lower()
#     found_items = m.Item.query.filter_by(name=new_item_name).first()
#     if found_items is None:
#         new_item = m.Item(name=new_item_name)
#         db.session.add(new_item)
#         db.session.commit()
#         return {'itemId': new_item.id}
    
    return {'itemId': found_items.id}

# @bp.route('/searchitem/<string:strs>', methods=['GET'])
# @login_required
# def searchitem(strs):

#     found_items = m.Item.query.filter(m.Item.name.ilike(f'%{strs.lower()}%')).limit(10).all()
#     list_items = []
#     for item in found_items:
#         list_items.append([item.id, item.name])

#     return list_items



# @bp.get('/delete_list_item/<int:id_list>/<int:id_item>')
# @login_required
# def delete_list_item(id_list, id_item):
#     cur_item_list = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, item_id=id_item).first()
#     if cur_item_list is not None:
#         db.session.delete(cur_item_list)
#         db.session.commit()
#         return {'is_delete': 1}
    
#     return {'is_delete': 0}

# @bp.get('/mark_list_item/<int:id_list>/<int:id_item>/<int:is_marked>')
# @login_required
# def mark_list_item(id_list, id_item, is_marked):
#     cur_item_list = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, item_id=id_item).first()
#     if cur_item_list is not None:
#         cur_item_list.is_marked = is_marked
#         db.session.flush()

#         cur_list = m.Shopping_list.query.filter_by(id=id_list).first()
#         not_marked_item = m.Shopping_list_item.query.filter_by(Shopping_list_id=id_list, is_marked=0).first()
#         if not_marked_item is None:
#             cur_list.is_marked = 1 
#         else:
#             cur_list.is_marked = 0 
            
#         db.session.commit() 
#         return {'change_marked': 1}
    
#     return {'change_marked': 0}




    