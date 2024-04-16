from app import db
from app.errors import bp
from flask import render_template, redirect, url_for

@bp.app_errorhandler(401)
def unauthorized_error(error):
    return redirect(url_for('auth.login'))

@bp.app_errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500