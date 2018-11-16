function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function signUp() {
    // debugger
    username = document.getElementById('username').value;
    fullname = document.getElementById('fullname').value;
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;
    bio = document.getElementById('bio').value;
    // console.log(username, fullname, email, password, bio);

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://localhost:5000/signUp");
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify ({
        "username": username,
        "fullname": fullname,
        "email":email,
        "password" :password,
        "bio" :bio
    }));

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200 || this.status == 201) {
            alert("Data Berhasil di Submit");
            window.location = "/Login.html";
        }
        else if (this.readyState == 4) {
            alert("Data Gagal di input: " +this.status);
        }
    }

    // alert('Ini adalah Name Twitter: ' + name);
    // console.log(name);
}   

function signIn() {
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.open("POST", "http://localhost:5000/login");
    xmlRequest.setRequestHeader("Content-Type", "application/json");
    xmlRequest.send(JSON.stringify( {
        "username" : username,
        "password" : password
    }));

    xmlRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200 || this.status == 201) {
            alert("Login Success");
            // console.log(this.response);  
            // localStorage.setItem('username', username);
            // localStorage.getItem('username');
            document.cookie = "username=" + this.response
            window.location = "/home.html";
        }
        else if (this.readyState == 4) {
            alert ("email atau password salah: "+this.status);
        }
    }

}

function tweetBox() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "http://localhost:5000/getProfile");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));

    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.response);
            document.getElementById('tweetbox-section').insertAdjacentHTML ("afterbegin",`<img src="${data.photo_profile}"/>
            <form onsubmit="event.preventDefault(); addTweet()" method="POST">
                <input type="text" id="tweet-box" placeholder="What's happening ?">
                <button type="submit" id="submit-tweet" style="margin-left: 520px;">Tweet</button>
            </form>`)};
        }
    xmlHttp.send()
}

function dropDown(){
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "http://localhost:5000/getProfile");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));

    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.response);
            document.getElementById('dropdown').insertAdjacentHTML ("afterbegin",`<img class="dropbtn" href="#" src="${data.photo_profile}" alt="orang"/>
            <div class="dropdown-content">
                <a id="profile-dropdown" href="profile.html?id=${data.person_id}"><i class="far fa-user"></i> ${data.fullname}</a>
                <a href="edit.html"><i class="fas fa-wrench"></i> Setting and Privacy</a>
                <a href="#"><i class="fas fa-info-circle"></i> Help Center</a>
                <a onclick="removeCookie()" href="Login.html" id="logout-button"><i class="fas fa-power-off"></i> Log Out</a>
            </div>`)};
        }
    xmlHttp.send()
}

function addTweet() {
    tweet = document.getElementById('tweet-box').value;

    var xmlHttp = new XMLHttpRequest;
    xmlHttp.open("POST", "http://localhost:5000/addTweet");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify ({
        "username" : getCookie("username"),
        "tweet": tweet
    }));

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            masukanTweet = this.response;
            // console.log(masukanTweet);
            document.getElementById('feed-section').insertAdjacentHTML ("afterbegin", `<div id="tweet_${masukanTweet.id}" class="tweet">
            <img src="${masukanTweet.photo_profile}" alt="foto orang"/>
            <h3>${masukanTweet.username}</h3>
            <p>${masukanTweet.tweet}</p>
            <span>${masukanTweet.date}</span> 
        </div>`);
        window.location = "/home.html"
        }
        else if (this.readyState == 4) {
            alert("Tweet Gagal: " +this.status);
        }
    }
}

function allTweet() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "http://localhost:5000/getTweet");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            // console.log(this.response);
            JSON.parse(this.response).forEach(function(masukanTweet,index) {
                // console.log(masukanTweet);
            document.getElementById('feed-section').insertAdjacentHTML ("afterbegin", `<div id="tweet_${masukanTweet.id}" class="tweet">
            <img src="${masukanTweet.photo_profile}" alt="foto orang" />
            <h3><a href="profile.html?id=${masukanTweet.person_id}">${masukanTweet.fullname}</a></h3><h4><a href="profile.html?id=${masukanTweet.person_id}">${masukanTweet.username}</a></h4>
            <p>${masukanTweet.content}</p>
            <span>${masukanTweet.date}</span>
            <button class="delete-button" type="submit" onclick="deleteTweet(${masukanTweet.id})" id="del${index}">Delete</button> 
            </div>`);         
            });
        }
        else if (this.readyState ==4 && this.status == 400){
            alert("Error : " +this.status + " " +this.statusText)
            window.location = '/signUp.html';
        }
    };
    xmlHttp.send();
}


function allTweetUser(id) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", "http://localhost:5000/getTweetUser");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify({
        "user_id" : id
    })); 
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            JSON.parse(this.response).forEach(function(data, index) {
                // console.log(masukanTweet);
            document.getElementById('feed-section').insertAdjacentHTML ("afterbegin", `<div id="tweet_${data.idTweet}" class="tweet">
            <img src="${data.photo_profile}" alt="foto orang" />
            <h3><a href="profile.html?id=${data.id}">${data.fullname}</a></h3>
            <h4><a href="profile.html?id=${data.id}">${data.username}</a></h4>
            <p>${data.contentTweet}</p>
            <span>${data.dateTweet}</span>
            <button class="delete-button" type="submit" onclick="deleteTweet(${data.idTweet})" id="del${index}">Delete</button> 
            </div>`);         
            });
        }
        else if (this.readyState ==4 && this.status == 400){
            alert("Error : " +this.status + " " +this.statusText)
            window.location = '/signUp.html';
        }
    };

}
// function removeCookie(){
//     document.cookie = 'username='
// }

function deleteTweet(id) {
    console.log(id);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open ("DELETE", "http://localhost:5000/deleteTweet");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify({
        "tweet_id" : id
    })); 

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status < 400 ){
            console.log(this.response);
            document.getElementById(this.response).remove();
            window.location = "/home.html";
        }
        else if (this.readyState == 4) {
            alert("You cannot delete others tweet! " + this.status);
        }
    }
}

function getProfile() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "http://localhost:5000/getProfile");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));

    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.response);
            document.getElementById('profile-section').insertAdjacentHTML ("afterbegin", `<img id="background-img" src="img/profile-background.jpg"/>
            <img id="photo-profile" src="${data.photo_profile}" style="margin-left: 10px;">
            <div id="profile-name">
                <b ><a id="fullname-profile" href="profile.html?id=${data.person_id}">${data.fullname}</a></b>
                <p ><a id="username-profile" href="profile.html?id=${data.person_id}">${data.username}</a></p>
            </div>
            <ul>
                <li><a id="countTweet" href="#">Tweets
                    <br>
                    
                </a></li>
                <li><a id="followings" href="#">Following
                    <br>
                   
                </a></li>
                <li><a id="followers" href="#">Followers
                    <br>
                    
                </a></li>
            </ul>`);         
        }
        else if (this.readyState ==4){
            alert("Error : " +this.status + " " +this.statusText)
        }
    };
    xmlHttp.send()
}

function editData(){
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("PUT", "http://localhost:5000/editProfile");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    var profile = {
        'username': document.getElementById('username').value,
        'fullname': document.getElementById('fullname').value,
        'email': document.getElementById('email').value,
        'bio': document.getElementById('bio').value,
        'photo_profile': document.getElementById('photo_profile').value
    }
    console.log(profile)
    xmlHttp.send(JSON.stringify(profile));
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = this.response;
            alert("Data has been edited " + this.status)
            window.location = "/home.html"
        }
        else if (this.readyState ==4 && this.status == 400){
            alert("Error : " +this.status + " " +this.statusText)
            window.location = '/Login.html';
        }
    }
}

function showEditData() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "http://localhost:5000/showEditData");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response);
            data = JSON.parse(this.response);
            document.getElementById('username').value = data.username;
            document.getElementById('fullname').value = data.fullname;
            document.getElementById('email').value = data.email;
            document.getElementById('bio').value = data.bio;
            document.getElementById('photo_profile').value = data.photo_profile;      
        }
        else if (this.readyState ==4 && this.status == 400){
            alert("Error : " +this.status + " " +this.statusText)
            window.location = '/signUp.html';
        }
    };
    xmlHttp.send();
}

function editPassword () {
    current_password = document.getElementById("current_password").value
    new_password = document.getElementById("new_password").value
    verify_password = document.getElementById("verify_password").value

    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("PUT", "http://localhost:5000/editPassword");
    xmlHttp.setRequestHeader("Authorization", getCookie("username"))
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify( {
        "current_password" : current_password,
        "new_password" : new_password,
        "verify_password" : verify_password
    }));

    xmlHttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.response)
            alert(this.response + this.status)
            window.location = "/home.html";
        }
        else if (this.readyState == 4 && this.status == 400) {
            alert(this.response + this.status)
        }
    };
}

function countTweet() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", "http://localhost:5000/countTweet");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4) {
            document.getElementById("countTweet").insertAdjacentHTML("beforeend", `<h5>${this.response}</h5>`)
        }
    }
    xmlHttp.send()
}

function followings() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", "http://localhost:5000/followings");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4) {
            document.getElementById("followings").insertAdjacentHTML("beforeend", `<h5>${this.response}</h5>`)
        }
    }
    xmlHttp.send()
}

function followers() {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", "http://localhost:5000/followers");
    xmlHttp.setRequestHeader("Authorization", getCookie('username'));
    xmlHttp.onreadystatechange = function (){
        if (this.readyState == 4) {
            document.getElementById("followers").insertAdjacentHTML("beforeend", `<h5>${this.response}</h5>`)
        }
    }
    xmlHttp.send()
}

