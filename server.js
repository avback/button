const express = require("express");
const path = require("path");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const app = express();
const axios = require("axios");
const envs = require("dotenv");
envs.config();

let uri = "https://av-98n5.onrender.com";

app
  .use(helmet({ contentSecurityPolicy: false }))
  .use(cookieParser())
  .use(express.json({ extended: true }))
  .use(express.urlencoded({ extended: true }))
  .use(
    expressSession({
      secret: "burden-oxen",
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "")));
app.use(express.static(path.join(__dirname, "/")));

app.post("/api/user/check/", async (req, res) => {
  try {
    if (req.session.intellisy) {
      let verifyToken = await jwt.verify(req.session.intellisy, "burden-oxen");
      if (verifyToken) {
        return res.status(200).json({
          status: true,
          accessToken: req.session.intellisy,
          uri: uri,
        });
      }
    }

    if (req.cookies.intellisy) {
      let verifyToken = await jwt.verify(req.cookies.intellisy, "burden-oxen");
      if (verifyToken) {
        req.session.intellisy = req.cookies.intellisy;
        return res.status(200).json({
          status: true,
          accessToken: req.cookies.intellisy,
          uri: uri,
        });
      }
    }

    return res.status(200).json({
      status: false,
    });
  } catch (e) {
    return res.status(200).json({
      status: false,
    });
  }
});

app.post("/api/user/register/", async (req, res) => {
  try {
    let { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(200).json({
        status: false,
        message: "All fields are required!",
      });
    }
    let { data: chechUser } = await axios.post(`${uri}/api/user/register/`, {
      phone: phone,
      password: password,
      server: true,
    });

    if (!chechUser.status) {
      return res.status(200).json({
        status: false,
        message: chechUser.message,
      });
    }
    req.session.intellisy = chechUser.a;
    res.cookie("intellisy", chechUser.a, {
      maxAge: 60 * 60 * 24 * 1000,
    });

    return res.status(200).json({
      status: true,
      uri: uri,
    });
  } catch (e) {
    return res.status(200).json({
      status: false,
      message: "please try again later!",
    });
  }
});

app.post("/api/user/login/", async (req, res) => {
  try {
    let { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(200).json({
        status: false,
        message: "All fields are required!",
      });
    }
    let { data: chechUser } = await axios.post(`${uri}/api/user/login/`, {
      phone: phone,
      password: password,
      server: true,
    });

    if (!chechUser.status) {
      return res.status(200).json({
        status: false,
        message: chechUser.message,
      });
    }

    req.session.intellisy = chechUser.a;
    res.cookie("intellisy", chechUser.a, {
      maxAge: 60 * 60 * 24 * 1000,
    });

    return res.status(200).json({
      status: true,
      uri: uri,
    });
  } catch (e) {
    return res.status(200).json({
      status: false,
      message: "please try again later!",
    });
  }
});

app.post("/logout", async (req, res) => {
  try {
    if(!req.session.intellisy) return 1;
    delete req.session.intellisy;
    res.cookie("intellisy", null, {
      maxAge: 0,
    });
    return res.status(200).json({
      status: true,
    });
  } catch (e) {
    delete req.session.intellisy;
    res.cookie("intellisy", null, {
      maxAge: 0,
    });
    return res.status(200).json({
      status: true,
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = 2025;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
