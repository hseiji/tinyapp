const { assert } = require('chai');

const { getUserId, getUserbyEmail } = require('../helper_functions');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserbyEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return a user with valid user id', function() {
    const user = getUserId(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined for an invalid email', function() {
    const user = getUserbyEmail(testUsers, "nothing@example.com");
    assert.equal(user, undefined);
  });

});