// Helper function: it generates random string
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

// Helper function: checks if user is already registered
const checkUser = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
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
  return undefined;
};

// Helper function: get user by email
const getUserbyEmail = (users, email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return undefined;
};

// Helper function: returns the URLs where userID === id current logged in
const urlsForUser = (id, database) => {
  const result = {};
  for(const url of Object.keys(database)) {
    if (database[url].userID === id) {
      result[url] = database[url];
    }
  }
  return result;
};

module.exports = {
  generateRandomString,
  checkUser,
  getUserId,
  urlsForUser,
  getUserbyEmail
};