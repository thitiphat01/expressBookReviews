const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");

const regd_users = express.Router();
const users = [];

// ตรวจว่า username ยังไม่ถูกใช้
const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

// ตรวจ username และ password
const authenticatedUser = (username, password) => {
  return users.some(
    (user) =>
      user.username === username &&
      user.password === password
  );
};

// Login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const accessToken = jwt.sign(
    { username: username },
    "access",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({
    message: "User successfully logged in"
  });
});

// เพิ่มหรือแก้ไข Review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!review) {
    return res.status(400).json({
      message: "Review is required"
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully posted",
    reviews: books[isbn].reviews
  });
});

// ลบ Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "Review not found"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;