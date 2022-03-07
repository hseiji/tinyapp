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
const checkUser = (users, email, password) => {
  for (const user in users) {
    // console.log("user", users[user].email);
    if (password !== "") {
      if (users[user].email === email && users[user].password === password) {
        return true;
      }
    } else {
      if (users[user].email === email) {
        return true;
      }
    }
  }
  return false;
};
// Helper function: get user id
const getUserId = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return "Error";
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// List all urls on the index page
app.get("/urls", (req, res) => {
  console.log(users);
  console.log(urlDatabase);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Renders the new URL page (if user is not logged in, redirects to the login page)
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    console.log("Please log in before creating a new short URL.");
    res.redirect('/login');
  } else {
    const templateVars = { 
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]
    };  
    res.render("urls_new", templateVars);
  }
});

// Create a new short URL
app.post("/urls", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    const tinyUrl = generateRandomString();
    // saving the new input on urlDatabase
    urlDatabase[tinyUrl] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    } // req.body.longURL comes from the form input
    res.redirect(`/urls/${tinyUrl}`); // redirects to page urls_show
  } else {
    console.log("Please log in before creating a new short URL.");
  }
});

// Delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Login GET - Login Page Template (redirects to /urls when is logged in)
app.get("/login", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      user: users["user_id"]
    };  
    res.render("login", templateVars);
  }
});

// Login POST - Set Cookies
app.post("/login", (req, res) => {
  // Check if user is registered and password matches
  if (checkUser(users, req.body.email, req.body.password)) {
    res.cookie("user_id", getUserId(users, req.body.email));
    res.redirect('/urls');
  } else {
    res.status(403).send("Email or password is invalid!");
  }
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
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users["user_id"]
  };
  res.render("urls_show", templateVars);
});

// Redirects the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  if (checkUser(users, req.body.email, "")) {
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