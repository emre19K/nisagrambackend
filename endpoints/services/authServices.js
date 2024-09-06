require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ _id: user._id }, JWT_SECRET);
};

const validateAndGiveToken = async (req) => {
  try {
    const { userID, password } = req.body;

    if(!userID || !password) throw new Error("Bitte füllen Sie alle Felder aus!")

    const user = await User.findOne({ userID });
    if (!user) throw new Error("Anmeldedaten ungültig.");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Anmeldedaten ungültig.");

    return generateToken(user);
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (!token) throw new Error("Zugriff verboten! Kein Token bereitgestellt.");

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) throw new Error("Zugriff verboten! Ungültiger Token.");
      req._id = decoded._id;
      next();
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const validateRegisterInput = async (req, res, next) => {
  const { email, userID, password } = req.body;

  try {
    // Email Format Regex
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Nickname darf nur Buchstaben und Zahlen beinhalten
    const regexNickname = /^[a-zA-Z0-9]+$/;

    // Mindestens 8 Zeichen -> davon mindestens 2 Zahlen
    const regexPassword = /^(?=.*[0-9].*[0-9]).{8,}$/;

    if (!email || !userID || !password)
      throw new Error("Bitte füllen Sie alle Felder aus.");

    if (!regexEmail.test(email))
      throw new Error("Bitte geben Sie eine gültige E-Mail an.");

    if (!regexNickname.test(userID))
      throw new Error("Der Nickname darf nur Zahlen und Buchstaben enthalten.");

    if (!regexPassword.test(password))
      throw new Error(
        "Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Zahlen beinhalten."
      );

    const existingUser = await User.findOne({ $or: [{ email }, { userID }] });

    if (existingUser) {
      if (existingUser.email === email)
        throw new Error("Die eingegebene E-Mail existiert bereits.");

      if (existingUser.userID === userID)
        throw new Error("Die eingegebene UserID existiert bereits.");
    }
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = {
  validateAndGiveToken,
  verifyToken,
  validateRegisterInput,
};
