from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from os import environ
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
app.config['SECRET_KEY'] = environ.get('SECRET_KEY')
db = SQLAlchemy(app)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    requests = db.relationship('Request', backref='user', lazy=True)
    offers = db.relationship('Offer', backref='user', lazy=True)
    friends = db.relationship('Friendship', foreign_keys='Friendship.user_id', backref='user', lazy=True)
    friend_of = db.relationship('Friendship', foreign_keys='Friendship.friend_id', backref='friend', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.name, 'email': self.email}

# Request Model
class Request(db.Model):
    __tablename__ = 'requests'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)

    def json(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'description': self.description,
            'category': self.category,
            'location': self.location,
            'price': self.price,
            'date_time': self.date_time.strftime('%Y-%m-%d %H:%M:%S')
        }

# Offer Model
class Offer(db.Model):
    __tablename__ = 'offers'
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    accepted = db.Column(db.Boolean, default=False)

    def json(self):
        return {
            'id': self.id,
            'request_id': self.request_id,
            'user_id': self.user_id,
            'price': self.price,
            'accepted': self.accepted
        }

# Friendship Model
class Friendship(db.Model):
    __tablename__ = 'friendships'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def json(self):
        return {'user_id': self.user_id, 'friend_id': self.friend_id}

# Notification Model
class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(200), nullable=False)
    read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def json(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'read': self.read,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

# Initialize the database
db.create_all()

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# User registration
@app.route('/api/flask/users', methods=['POST'])
def create_user():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'}), 201

# User login
@app.route('/api/flask/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login failed!'}), 401
    token = jwt.encode({'user_id': user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                       app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({'token': token})

# Token refresh
@app.route('/api/flask/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    token = jwt.encode({'user_id': current_user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                       app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({'token': token})

# Create a request
@app.route('/api/flask/requests', methods=['POST'])
@token_required
def create_request(current_user):
    data = request.get_json()
    new_request = Request(
        user_id=current_user.id,
        description=data['description'],
        category=data['category'],
        location=data['location'],
        price=data['price'],
        date_time=datetime.datetime.strptime(data['date_time'], '%Y-%m-%d %H:%M:%S')
    )
    db.session.add(new_request)
    db.session.commit()
    
    # Create notifications for friends
    for friend in current_user.friends:
        notification = Notification(user_id=friend.friend_id, message=f"{current_user.name} created a new request")
        db.session.add(notification)
    db.session.commit()

    return jsonify({'message': 'New request created!'}), 201

# Get all requests from friends
@app.route('/api/flask/requests', methods=['GET'])
@token_required
def get_requests(current_user):
    friends_ids = [friend.friend_id for friend in current_user.friends]
    requests = Request.query.filter(Request.user_id.in_(friends_ids)).all()
    return jsonify([request.json() for request in requests])

# Create an offer for a request
@app.route('/api/flask/offers', methods=['POST'])
@token_required
def create_offer(current_user):
    data = request.get_json()
    new_offer = Offer(
        request_id=data['request_id'],
        user_id=current_user.id,
        price=data['price']
    )
    db.session.add(new_offer)
    db.session.commit()
    return jsonify({'message': 'New offer created!'}), 201

# Get offers for a request
@app.route('/api/flask/requests/<request_id>/offers', methods=['GET'])
@token_required
def get_offers(current_user, request_id):
    offers = Offer.query.filter_by(request_id=request_id).all()
    return jsonify([offer.json() for offer in offers])

# Create a friendship
@app.route('/api/flask/friendships', methods=['POST'])
@token_required
def create_friendship(current_user):
    data = request.get_json()
    new_friendship = Friendship(user_id=current_user.id, friend_id=data['friend_id'])
    db.session.add(new_friendship)
    db.session.commit()
    return jsonify({'message': 'Friendship created!'}), 201

# Get user's friends
@app.route('/api/flask/friends', methods=['GET'])
@token_required
def get_friends(current_user):
    friends = Friendship.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': friend.friend.id, 'name': friend.friend.name} for friend in friends])

# Get user's notifications
@app.route('/api/flask/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id).all()
    return jsonify([notification.json() for notification in notifications])

# Update user profile
@app.route('/api/flask/users/<id>', methods=['PUT'])
@token_required
def update_user(current_user, id):
    user = User.query.filter_by(id=id).first()
    if user:
        data = request.get_json()
        user.name = data['name']
        user.email = data['email']
        if 'password' in data:
            user.password = generate_password_hash(data['password'], method='sha256')
        db.session.commit()
        return jsonify({'message': 'User updated!'}), 200
    return jsonify({'message': 'User not found!'}), 404

# Delete user
@app.route('/api/flask/users/<id>', methods=['DELETE'])
@token_required
def delete_user(current_user, id):
    user = User.query.filter_by(id=id).first()
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted!'}), 200
    return jsonify({'message': 'User not found!'}), 404

# Test route
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'The server is running'})

if __name__ == '__main__':
    app.run(debug=True)
