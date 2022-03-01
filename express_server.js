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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const tinyUrl = generateRandomString();
  urlDatabase[tinyUrl] = req.body.longURL;
  res.redirect(`/urls/${tinyUrl}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  // console.log(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  // Edge case: non-existent shortURL
  if (longURL === undefined) {
    res.send("This short url does not exist");
  }
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});