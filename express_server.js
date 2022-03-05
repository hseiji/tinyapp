const generateRandomString = () => {
  // Generate a random string of length 6 characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  result = [];
  for (let i = 0; i < length; i++) {
    result.push(chars[Math.floor(Math.random() * chars.length - 1)]);
  }
  return result.join('');
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Helper function: checks if user is already registered
const checkUser = (users, email) => {
  for (const user in users) {
    console.log("user", users[user].email);
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// List all urls on the index page
app.get("/urls", (req, res) => {
  console.log(users);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Renders the new URL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Create a new short URL
app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  // saving the new input on urlDatabase
  urlDatabase[tinyUrl] = req.body.longURL; // req.body.longURL comes from the form input
  res.redirect(`/urls/${tinyUrl}`); // redirects to page urls_show
});

// Route to edit the URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

// Delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Login GET - Login Page Template
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users["user_id"]
  };  
  res.render("login", templateVars);
});

// Login POST - Set Cookies
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  res.redirect('/urls');
});

// Logout Route - Clear Cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// Load urls_show page with the selected short/long URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users["user_id"]
  };
  res.render("urls_show", templateVars);
});

// Redirects the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  // Edge case: non-existent shortURL
  if (longURL === undefined) {
    res.send("This short url does not exist");
  }
  res.redirect(longURL);
});

// User Registration - Load page/form
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users["user_id"]
  };  
  res.render("register", templateVars);
});

// User Registration - POST form/user information
app.post("/register", (req, res) => {
  // If email or password are ""
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid username or password!");
  }
  // If email is already registered in the database
  if (checkUser(users, req.body.email)) {
    res.status(400).send("User already registered!");
  }

  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", newId);
  res.redirect("/urls")
});

// Server listening on Port ...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});