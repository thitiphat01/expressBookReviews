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
 * Retrieve books using async/await with Axios.
 */

const BASE_URL = "http://localhost:5000";

// Task 10: Retrieve all books
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);

    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    console.error(
      "Error retrieving all books:",
      error.message
    );

    return null;
  }
}

// Task 11: Retrieve a book by ISBN
async function getBooksByISBN(isbn) {
  try {
    const response = await axios.get(
      `${BASE_URL}/isbn/${encodeURIComponent(isbn)}`
    );

    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("Book not found");
      return null;
    }

    console.error(
      "Error retrieving book by ISBN:",
      error.message
    );

    return null;
  }
}

// Task 12: Retrieve books by author
async function getBooksByAuthor(author) {
  try {
    const encodedAuthor = encodeURIComponent(author);

    const response = await axios.get(
      `${BASE_URL}/author/${encodedAuthor}`
    );

    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("No books found for this author");
      return null;
    }

    console.error(
      "Error retrieving books by author:",
      error.message
    );

    return null;
  }
}

// Task 13: Retrieve books by title
async function getBooksByTitle(title) {
  try {
    const encodedTitle = encodeURIComponent(title);

    const response = await axios.get(
      `${BASE_URL}/title/${encodedTitle}`
    );

    if (response.status === 200) {
      console.log(response.data);
      return response.data;
    }

    return null;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("No books found with this title");
      return null;
    }

    console.error(
      "Error retrieving books by title:",
      error.message
    );

    return null;
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;