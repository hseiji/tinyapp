const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString, checkUser, getUserId, urlsForUser } = require('./helper_functions');
const { users, urlDatabase } = require('./data/database');

app.set("view engine", "ejs");
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// GET ------------------------------------------------------
// Homepage
app.get("/", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id]
  };  
  res.render("home", templateVars);
});

// List all urls on the index page
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
    message: "Please be advised to log in."
  };
  // If user is not logged in - Error HTML page
  if (!users[req.session.user_id]) {
    res.render("error", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

// Renders the new URL page (if user is not logged in, redirects to the login page)
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    console.log("Please log in before creating a new short URL.");
    res.redirect('/login');
  } else {
    const templateVars = { 
      urls: urlDatabase,
      user: users[req.session.user_id]
    };  
    res.render("urls_new", templateVars);
  }
});

// Login GET - Login Page Template (redirects to /urls when is logged in)
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users["user_id"]
    };  
    res.render("login", templateVars);
  }
});

// Load urls_show page with the selected short/long URL
app.put("/urls/:shortURL", (req, res) => {
  // If URL is valid (included in urlDatabase)
  if(Object.keys(urlDatabase).includes(req.params.shortURL)) {
    req.session.views = (req.session.views || 0) + 1; // Analytics of visits 
    console.log(req.session);
    let templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      user: users[req.session.user_id],
      countViews: urlDatabase[req.params.shortURL].countViews,
      uniqueVisitors: urlDatabase[req.params.shortURL].uniqueVisitors.length,
      timestamps: urlDatabase[req.params.shortURL].timestamps,
      message: "Please be advised to be logged in and you are only allowed to edit/delete your own URLs."
    };
    // If user is not logged in or tries to edit a URL that does not belong to the person - Error HTML page
    if (!users[req.session.user_id] || urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
      res.render("error", templateVars);
    } else {
      res.render("urls_show", templateVars);
    }
  } else {
    const templateVars = { user: users[req.session.user_id], message: "This short URL is invalid." };
    res.render("error", templateVars);
  }
});

// Redirects the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // Edge case: non-existent shortURL
  if (longURL === undefined) {
    return res.send("This short url does not exist");
  }
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString();
  }
  if (!urlDatabase[req.params.shortURL].uniqueVisitors.includes(req.session.visitor_id)) {
    urlDatabase[req.params.shortURL].uniqueVisitors.push(req.session.visitor_id);
  }
  urlDatabase[req.params.shortURL].countViews++;
  urlDatabase[req.params.shortURL].timestamps.push({ time: Date(), visitorId: req.session.visitor_id });
  console.log(longURL);
  res.redirect(longURL);
});

// User Registration - Load page/form
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users["user_id"]
  };  
  res.render("register", templateVars);
});

// POST ------------------------------------------------------
// Create a new short URL (must be logged in)
app.post("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    const tinyUrl = generateRandomString();
    // saving the new input on urlDatabase
    urlDatabase[tinyUrl] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
      uniqueVisitors: [],
      countViews: 0
    }
    res.redirect(`/urls/${tinyUrl}`); // redirects to page urls_show
  } else {
    console.log("Please log in before creating a new short URL.");
  }
});

// Delete an URL
app.delete("/urls/:shortURL", (req, res) => {
  // If user is not logged in or tries to edit a URL that does not belong to the user - Error HTML page
  if (!users[req.session.user_id] || urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.send("Please be advised to be logged in and you are only allowed to edit/delete your own URLs.");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }    
});

// Login POST - Set Cookies
app.post("/login", (req, res) => {
  // Check if user is registered and password matches
  if (checkUser(users, req.body.email) && bcrypt.compareSync(req.body.password, users[getUserId(users, req.body.email)].password)) {
    req.session.user_id = getUserId(users, req.body.email);
    res.redirect('/urls');
  } else {
    res.status(403).send("Email or password is invalid!");
  }
});

// Logout Route - Clear Cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// User Registration - POST form/user information
app.post("/register", (req, res) => {
  let errors = false;
  // If email or password are ""
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid username or password!");
    errors = true;
  }
  // If email is already registered in the database
  if (checkUser(users, req.body.email)) {
    res.status(400).send("User already registered!");
    errors = true;
  }
  if (!errors) {
    const newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    // res.cookie("user_id", newId);
    req.session.user_id = newId;
    res.redirect("/urls")
  }
});

// Server listening on Port ...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});