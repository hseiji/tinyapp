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

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

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
  const templateVars = { urls: urlDatabase };
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

// Load urls_show page with the selected short/long URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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


// Server listening on Port ...
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});