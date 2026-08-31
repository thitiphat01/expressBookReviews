const express = require("express");
const axios = require("axios");

const books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({
    username,
    password
  });

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});

// Get all books
public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});

// Get book by ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(book);
});

// Get books by author
public_users.get("/author/:author", (req, res) => {
  const requestedAuthor = req.params.author.toLowerCase();

  const matchedBooks = Object.keys(books)
    .filter((isbn) => {
      return (
        books[isbn].author.toLowerCase() === requestedAuthor
      );
    })
    .reduce((result, isbn) => {
      result[isbn] = books[isbn];
      return result;
    }, {});

  if (Object.keys(matchedBooks).length === 0) {
    return res.status(404).json({
      message: "No books found for this author"
    });
  }

  return res.status(200).json(matchedBooks);
});

// Get books by title
public_users.get("/title/:title", (req, res) => {
  const requestedTitle = req.params.title.toLowerCase();

  const matchedBooks = Object.keys(books)
    .filter((isbn) => {
      return (
        books[isbn].title.toLowerCase() === requestedTitle
      );
    })
    .reduce((result, isbn) => {
      result[isbn] = books[isbn];
      return result;
    }, {});

  if (Object.keys(matchedBooks).length === 0) {
    return res.status(404).json({
      message: "No books found with this title"
    });
  }

  return res.status(200).json(matchedBooks);
});

// Get reviews by ISBN
public_users.get("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(book.reviews);
});

/*
 * Axios functions for Tasks 10–13
 * These functions demonstrate callbacks, Promises and async/await.
 */

// Task 10: Get all books using async/await
async function getAllBooks() {
  try {
    const response = await axios.get(
      "http://localhost:5000/"
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Unable to retrieve all books:",
      error.message
    );

    throw error;
  }
}

// Task 11: Search by ISBN using Promise callbacks
function getBookByISBN(isbn) {
  return axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Unable to retrieve book by ISBN:",
        error.message
      );

      throw error;
    });
}

// Task 12: Search by author using async/await
async function getBooksByAuthor(author) {
  try {
    const encodedAuthor = encodeURIComponent(author);

    const response = await axios.get(
      `http://localhost:5000/author/${encodedAuthor}`
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Unable to retrieve books by author:",
      error.message
    );

    throw error;
  }
}

// Task 13: Search by title using Promise callbacks
function getBooksByTitle(title) {
  const encodedTitle = encodeURIComponent(title);

  return axios
    .get(`http://localhost:5000/title/${encodedTitle}`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Unable to retrieve books by title:",
        error.message
      );

      throw error;
    });
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;