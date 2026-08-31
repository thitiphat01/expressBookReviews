const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const customer_routes =
  require("./router/auth_users.js").authenticated;

const genl_routes =
  require("./router/general.js").general;

const app = express();

// อ่านข้อมูล JSON จาก Request
app.use(express.json());

// สร้าง Session สำหรับเส้นทาง /customer
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: false
  })
);

// ตรวจสอบ Login และ JWT ก่อนเข้า /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({
      message: "User not logged in"
    });
  }

  const token = req.session.authorization.accessToken;

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "User not authenticated"
      });
    }

    req.user = user;
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});