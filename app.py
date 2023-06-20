from flask import Flask, request, redirect, url_for, flash, jsonify, Response, session
from flask_login import LoginManager, login_user, current_user, login_required, logout_user, UserMixin, AnonymousUserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate
from datetime import datetime, timedelta

import json

app = Flask(__name__)
cors = CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Software-Samurai'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


class Usernew(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(80), unique=True, nullable=False)
    lastname = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120))

    def is_active(self):
        return True

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    count = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=True, default=0.0)
    discounted_price = db.Column(db.Float, nullable=True, default=0.0)
    hasDiscount = db.Column(db.Boolean, nullable=False, default=False)
    offer_price = db.Column(db.Float, nullable=True)
    offer_expiration = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usernew.id'))  # New foreign key column

    def __init__(self, name, category, description, user_id, price=0.0, count=0, discounted_price=0.0, offer_price=None, offer_expiration=None ):
        self.name = name
        self.category = category
        self.description = description
        self.price = price
        self.count = count
        self.discounted_price = discounted_price
        self.offer_price = offer_price
        self.offer_expiration = offer_expiration
        self.user_id = user_id

    def set_offer(self, offer_price, offer_duration):
        self.offer_price = offer_price
        self.offer_expiration = datetime.utcnow() + timedelta(hours=offer_duration)

    def is_offer_active(self):
        return self.offer_expiration is not None and datetime.utcnow() <= self.offer_expiration


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy=True)


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)


@login_manager.user_loader
def load_user(user_id):
    return Usernew.query.get(int(user_id))

@ app.route('/register', methods=['GET', 'POST'])
def register():
    try:
        if request.method == 'POST':
            # print(request.form)
            data = request.get_json()
            role = data['role']
            firstname = data['firstname']
            lastname = data['lastname']
            email = data['email']
            mobile = data['mobile']
            password = generate_password_hash(
                data['password'], method='sha256')

            # Check if user already exists
            if Usernew.query.filter_by(email=email).first():
                flash('Email address already exists')
                return Response(response=json.dumps({"Value": 'User Already Exist'}), status=200)

            user = Usernew(firstname=firstname, lastname=lastname,
                           email=email, mobile=mobile, password=password, role=role)
            db.session.add(user)
            db.session.commit()
            print(user.firstname)
            print(user.lastname)
            print(user.email)
            print(user.password)
            return Response(response=json.dumps({'firstname': user.firstname, 'lastname': user.lastname, 'email': user.email, 'password': user.password, 'role': user.role}), status=201)

    except Exception as e:
        return jsonify({'Error': str(e)})

current_user_id = None
@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data['email']
        password = data['password']

        user = Usernew.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            global current_user_id
            session['user_id'] = current_user_id
            session['isLoggedIn'] = True  # Set isLoggedIn flag to True

            response_data = {
                'message': 'Login Successful',
                'role': user.role,
                'user_id': user.id
            }
            return jsonify(response_data)
        else:
            response_data = {
                'message': 'Invalid username or password',
                'logged_in': False
            }
            return jsonify(response_data)

    elif request.method == 'GET':
        if current_user.is_authenticated:
            response_data = {
                'message': 'User logged in',
                'logged_in': True,
                'role': current_user.role,
                'user_id': current_user.id
            }
        else:
            response_data = {
                'message': 'User not logged in',
                'logged_in': False
            }
        return jsonify(response_data)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('user_id', None)
    session['isLoggedIn'] = False  # Set isLoggedIn flag to False

    response_data = {
        'message': 'Logged out successfully',
        'logged_in': False
    }
    return jsonify(response_data)



@app.route('/addproduct', methods=['GET', 'POST', 'PUT', 'DELETE'])
def add_product():
    if request.method == 'GET':
        category = request.args.get('category')
        if category is None:
            # Retrieve all products from the database
            products = Product.query.all()
        else:
            category = category.replace("_", " ")
            products = Product.query.filter_by(category=category).all()
        data = []

        for product in products:
            product_data = {
                'id': product.id,
                'name': product.name,
                'category': product.category,
                'description': product.description,
                'count': product.count,
                'price': product.price,
                'discounted_price': product.discounted_price,
                'offer_valid_till': product.offer_expiration
            }

            data.append(product_data)

        return jsonify(data)

    elif request.method == 'POST':
        # Create or update a product
        data = request.get_json()
        id = data.get('userId')
        category = data.get('category')
        name = data.get('name')
        count = int(data.get('count'))
        description = data.get('description')
        price = float(data.get('price'))
        offer = float(data.get('offer'))
        offer_duration = data.get('offerDuration')  # New field for offer duration in hours

        existing_product = Product.query.filter_by(name=name, user_id=id).first()
        if existing_product:
            # Check if the current user is the one who added the product
            
            existing_product.count += count  # Increase the count if the product already exists
            existing_product.price = price
            existing_product.description = description
            existing_product.discounted_price = offer
            existing_product.offer_expiration = offer_duration

            if offer:
                existing_product.discounted_price = existing_product.price - (existing_product.price * (existing_product.discounted_price / 100))
                existing_product.hasDiscount = True
                existing_product.set_offer(offer, offer_duration)  # Set the offer and offer duration
            else:
                existing_product.discounted_price = 0
                existing_product.offer_price = None
                existing_product.offer_expiration = None
                existing_product.hasDiscount = False

            db.session.commit()
            updated_product = existing_product
            message = "Product successfully updated"
        else:
            product = Product(
                name=name, category=category, description=description,
                price=price, count=count, discounted_price=offer,
                offer_expiration=offer_duration, user_id=id
            )

            if offer:
                product.discounted_price = product.price - (product.price * (product.discounted_price / 100))
                product.hasDiscount = True
                product.set_offer(offer, offer_duration)  # Set the offer and offer duration
            else:
                product.discounted_price = 0
                product.offer_price = None
                product.offer_expiration = None
                product.hasDiscount = False

            db.session.add(product)
            db.session.commit()
            updated_product = product
            message = "Product created successfully"

        response_data = {
            'message': message,
            'product': {
                'id': updated_product.id,
                'name': updated_product.name,
                'category': updated_product.category,
                'description': updated_product.description,
                'count': updated_product.count,
                'price': updated_product.price,
                'discounted_price': updated_product.discounted_price,
                'offer_expiration': updated_product.offer_expiration.strftime('%Y-%m-%d %H:%M:%S') if updated_product.offer_expiration else None
            }
        }
        return jsonify(response_data)



@app.route('/placeorder', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        address = data.get('address')
        city = data.get('city')
        state = data.get('state')
        pincode = data.get('pincode')
        items = data.get('items')

        order = Order(address=address, city=city, state=state, pincode=pincode)
        db.session.add(order)
        db.session.commit()

        for item in items:
            product_name = item.get('product_name')
            quantity = item.get('quantity')
            order_item = OrderItem(
                product_name=product_name, quantity=quantity, order=order)
            db.session.add(order_item)

        # Update product count
        for item in items:
            product_name = item.get('product_name')
            quantity = item.get('quantity')
            product = Product.query.filter_by(name=product_name).first()
            if product:
                product.count -= quantity
                db.session.commit()

        return jsonify({'message': 'Order placed successfully'})

    except Exception as e:
        return jsonify({'Error': str(e)})


@app.route('/products/<category>')
def get_products_by_category(category):
    products = Product.query.filter_by(category=category).all()
    serialized_products = [{'name': p.name, 'count': p.count, 'price': float(
        p.price), 'discounted_price': float(p.discounted_price)} for p in products]
    return jsonify(serialized_products)


if __name__ == '__main__':
    from flask_cors import CORS
    CORS(app)
    with app.app_context():
        db.create_all()

    app.run(port=8000, debug=True)

