from flask import Flask, request, json, make_response, session
from flask_sqlalchemy import SQLAlchemy
from flask_restful import marshal,fields
from flask_cors import CORS
import datetime
import os
import jwt

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Sembilantujuh97@localhost:5432/Twitter'
app.config['SECRET_KEY'] = os.urandom(24)
jwtSecretKey = "rahasia"

db = SQLAlchemy(app)

class Person (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    fullname = db.Column(db.String())
    email = db.Column(db.String())
    password = db.Column(db.String())
    bio = db.Column(db.String(100))
    photo_profile = db.Column(db.String())

    tweet = db.relationship('Tweets', backref='owner')

class Tweets(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(140))
    date = db.Column(db.DateTime(), default=datetime.datetime.utcnow)
    person_id = db.Column(db.Integer, db.ForeignKey('person.id'))

class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('person.id'))
    following = db.Column(db.Integer, db.ForeignKey('person.id'))

@app.route('/signUp', methods=["POST"])
def signUp ():
    if request.method == "POST":
        req_data = request.get_json()

        # ngirim ke Database
        sent_data = Person(
            #harus sesuai urutan yang di class person
            username = req_data.get('username'),
            fullname = req_data.get('fullname'),
            email = req_data.get('email'),
            password = req_data.get('password'),
            bio = req_data.get('bio'),
            photo_profile = req_data.get('photo_profile')
        )

        #add to Data Base
        db.session.add(sent_data)
        db.session.commit()

        return "BISA TOT", 200
    else:
        return "Method Not Allowed",405

@app.route ('/login', methods= ["POST"])
def login():
    if request.method == "POST":
        req_data = request.get_json()

        #check data exist 
        req_username = req_data.get('username')
        req_password = req_data.get('password')
        
        #user yang ada di DB
        userDB = Person.query.filter_by(username=req_username, password=req_password).first()
        if userDB is not None:
            payload = {
                'username' : userDB.username,
                'key' : 'secret'
            }
            encoded = jwt.encode(payload, "rahasia", algorithm="HS256")

            return encoded, 200
        else:
            return "Usename or Password didn't match", 404
            
            
# Tweet Routing
@app.route('/addTweet', methods=["POST"])
def addTweet():
    if request.method == "POST":
        req_data = request.get_json()
        try:
            decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
            req_username = decoded["username"]
            if decoded['key'] != 'secret':
                return "You have to logged in", 400
        except jwt.exceptions.DecodeError:
            return "You have to logged in", 400

        userDB = Person.query.filter_by(username= req_username).first()
        req_tweet = req_data.get("tweet")
        if userDB is not None:
            tweet = Tweets (
                content = req_tweet,
                owner= userDB
            )

            db.session.add(tweet)
            db.session.commit()
            return "Tweet Success"
        else:
            return 'Please Login or Sign Up first',500

@app.route('/getTweet', methods = ["GET","POST"])
def getTweet():
    if request.method == "GET":
        try:
            decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
            req_username = decoded["username"]
            if decoded['key'] != 'secret':
                return "You have to logged in", 400
        except jwt.exceptions.DecodeError:
            return "You have to logged in", 400
        
        tweets = Tweets.query.join(Person, Person.id == Tweets.person_id).add_columns(Tweets.id, Tweets.content, Tweets.date, Person.username, Person.fullname, Person.photo_profile, Person.id).order_by(Tweets.date)
        user = []
        for data in tweets:
            user_tweets = {
            "id" : data[1],
            "content" : data[2],
            "date" : data [3],
            "username" : data[4],
            "fullname" : data[5],
            "photo_profile" : data[6],
            "person_id" : data [7]
            }
            user.append(user_tweets)
        
        tweet_json = json.dumps(user)
        
        return tweet_json, 200

@app.route('/getTweetUser', methods= ["POST"])
def getTweetUser():
    
    if request.method == "POST":
        try:
            decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
            req_username = decoded["username"]
            if decoded['key'] != 'secret':
                return "You have to logged in", 400
        except jwt.exceptions.DecodeError:
            return "You have to logged in", 400
    req_data = request.get_json()
    req_id  = req_data.get('user_id')
    # print(req_id)
    userDB = Person.query.filter_by(id = req_id).first()
    userTweet = []
    for data in userDB.tweet:
        tweet = {
            'id': userDB.id,
            'username': userDB.username,
            'fullname': userDB.fullname,
            'photo_profile': userDB.photo_profile,
            'idTweet': data.id,
            'contentTweet': data.content,
            'dateTweet': data.date
        }
        userTweet.append(tweet)
    
    userTweet_json = json.dumps(userTweet)
    return userTweet_json, 200

@app.route('/showEditData', methods= ["GET"])
def showEditData():
    if request.method == "GET":
        try:
            decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
            req_username = decoded["username"]
            if decoded['key'] != 'secret':
                return "You have to logged in", 400
        except jwt.exceptions.DecodeError:
            return "You have to logged in", 400
        
        userDB = Person.query.filter_by(username = req_username).first()
        user = []
        dataEdit = {
        "username" : userDB.username,
        "fullname" : userDB.fullname,
        "email" : userDB.email,
        "bio" : userDB.bio,
        "photo_profile" : userDB.photo_profile
        }
        user.append(dataEdit)
        print(dataEdit)
        
        edit_json = json.dumps(dataEdit)
        
        return edit_json, 200

@app.route('/editProfile', methods= ["PUT"])
def editProfile():
    if request.method == "PUT":
        try:
            decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
            req_username = decoded["username"]
            if decoded['key'] != 'secret':
                return "You have to logged in", 400
        except jwt.exceptions.DecodeError:
            return "You have to logged in", 400

    #new data
    req_data = request.get_json()
    username = req_data.get('username')
    fullname = req_data.get('fullname')
    email = req_data.get('email')
    bio = req_data.get('bio')
    photo_profile = req_data.get('photo_profile')

    if request.method == "PUT":
        userDB = Person.query.filter_by(username=req_username).first()
        userDB.username = username
        userDB.fullname = fullname
        userDB.email = email
        userDB.bio = bio
        userDB.photo_profile = photo_profile

        db.session.commit()

        return 'Data successfully edited', 200
    
    return 'Method Not Allowed', 405

@app.route('/editPassword', methods = ["PUT"])
def editPassword():
    req_data = request.get_json()
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400

    req_current_password = req_data.get('current_password')
    req_new_password = req_data.get('new_password')
    req_verify_password = req_data.get('verify_password')

    if request.method == "PUT":
        userDB = Person.query.filter_by(username = req_username).first()

        if userDB is not None and userDB.password == req_current_password:
            if req_new_password == req_verify_password:
                userDB.password = req_new_password
                db.session.commit()

                return "Password successfully changed ",200
            
            return "New password and validate password not match ",400
         
        return "Current password is wrong ",400
        
@app.route('/deleteTweet', methods = ["DELETE"])
def deleteTweet():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400
    
    req_data = request.get_json()
    tweet_id = req_data.get("tweet_id")
    
    
    if request.method == "DELETE":  
        tweets = Tweets.query.filter_by(id = tweet_id).first()
        userDB= Person.query.filter_by(username= req_username).first()
        if tweets.person_id != userDB.id:
            return "you cannot delete", 400

        db.session.delete(tweets)
        db.session.commit() 

        id = "tweet_" + str(tweets.id)
        id_user = ""
        return id, 200
           
@app.route('/getProfile', methods = ["GET"])
def getProfile():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400
    
    userDB = Person.query.filter_by(username= req_username).first()
    req_photo_profile = userDB.photo_profile
    req_fullname = userDB.fullname
    req_id = userDB.id

    data = {
        "username" : userDB.username,
        "photo_profile" : req_photo_profile,
        "fullname" : req_fullname,
        "person_id" : req_id
    }

    data_json = json.dumps(data)
    return data_json, 200

@app.route('/followings', methods = ["POST"])
def following():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400

    userDB = Person.query.filter_by(username = req_username).first()
    req_id = userDB.id
    followings = Follow.query.filter_by(user_id=req_id).count()

    return str(followings), 201

@app.route('/followers', methods = ["POST"])
def followers():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400

    userDB = Person.query.filter_by(username = req_username).first()
    req_id = userDB.id
    followers = Follow.query.filter_by(following=req_id).count()

    return str(followers), 201

@app.route('/countTweet', methods = ["POST"])
def countTweet():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400

    userDB = Person.query.filter_by(username = req_username).first()
    req_id = userDB.id
    tweetCount = Tweets.query.filter_by(person_id=req_id).count()

    return str(tweetCount), 201

@app.route('/showsuggestion', methods = ['POST'])
def show_suggestion():
    try:
        decoded = jwt.decode(request.headers["Authorization"], jwtSecretKey, algorithms=['HS256'])
        req_username = decoded["username"]
        if decoded['key'] != 'secret':
            return "You have to logged in", 400
    except jwt.exceptions.DecodeError:
        return "You have to logged in", 400
    # request_data = request.get_json()
    # print(request_data)
    # username = request_data.get('username')
    # print(username)
    userDB = Person.query.filter(Person.username != decoded['username']).all()
    # print(userDB)
    current = []
    suggestion = []
    i = 0
    if request.method == 'POST':
        while i < 3:
            index = randint(0, (len(userDB)-1))
            if index in current:
                continue
        # print(index)
            current.append(index)
            suggestion.append(userDB[index])
            i += 1
        # print(suggestion)
        json_format = {
            'id' : fields.Integer,
            'username': fields.String,
            'fullname' : fields.String,
            'photoprofile' : fields.String
            }

        user_json = json.dumps(marshal(suggestion, json_format))
        # print(user_json)
        return user_json, 200
    else:
        return 'Method not allowed', 400
    return 'ok', 200

# --------------------SESSION------------------------
@app.route('/setSession')
def setSession():
    session['username'] = '@faradilla'
    return 'Session has been set', 200

@app.route('/readSession')
def readSession():
    if 'username' in session:
        return 'Session '+session['username']+ ' does exist'

    return "Session does not exist, please login"

@app.route('/dropSession')
def dropSession():
    session.pop('username', None)
    return 'Session has been dropped'

#----------------COOKIES-----------------------------
@app.route('/setCookie')
def setCookie():
    username = '@prasetya'
    resp = make_response('')
    resp.set_cookie('username', username)
    return resp

@app.route('/readCookie')
def readCookie():
    cookie = request.cookies.get('username')
    return 'The Cookie is ' + cookie, 200

if __name__ == '__main__':
    app.run(debug=True)


# @app.route('/getTweet')
# def getTweet():
#     # if request.method == "GET":
#     req_data = request.get_json()
#     req_username = req_data.get('username')

#     userDB = Person.query.filter_by(username=req_username).first()
#     userTweet = userDB.tweet

#     #convert to json
#     json_format = {
#         'content' : fields.String,
#         'date' : fields.DateTime
#     }

#     tweet_json = json.dumps(marshal(userTweet, json_format))
#     return tweet_json