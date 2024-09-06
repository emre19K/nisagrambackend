const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const findAll = async () => {
  try {
    let allUser = await User.find().exec();
    return allUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findSpecificUser = async (req) => {
  const _id = req.params._id;

  try {
    if (!_id) throw new Error("Bitte geben Sie eine _id an.");

    let user = await User.findOne({ _id: _id }).exec();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findIfUserIsVerified = async (req) => {
  const userID = req.params.userID;

  try {
    let user = await User.findOne({ userID });
    if (user && user.verified) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const findIfUserIDExistsByTerm = async (req) => {
  try {
    let user = await User.findOne({ userID: req.params.term }).exec();
    if (!user) return true;
    throw new Error("UserID existiert bereits.");
  } catch (error) {
    throw new Error(error.message);
  }
};

const findIfEMailExistsByTerm = async (req) => {
  try {
    if (!req.params.term) throw new Error("Bitte geben Sie eine E-Mail an.");

    // Email Format Regex
    const regexEmail = new RegExp(
      "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    if (!regexEmail.test(req.params.term))
      throw new Error("Bitte geben Sie eine gültige E-Mail Adresse ein.");

    let user = await User.findOne({ email: req.params.term }).exec();
    if (!user) return true;
    throw new Error("E-Mail existiert bereits.");
  } catch (error) {
    throw new Error(error.message);
  }
};

const findUserByTerm = async (req) => {
  try {
    if (!req.params.term) return;
    let term = req.params.term.toLowerCase();
    let regexp = new RegExp(term, "i");
    let user = await User.find({ userID: regexp });
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendForgotPasswordMail = async (req) => {
  try {
    if (!req.body.email)
      throw new Error("Bitte geben Sie eine E-Mail Adresse ein.");

    let email = req.body.email;

    // Email Format Regex
    const regexEmail = new RegExp(
      "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    if (!regexEmail.test(email))
      throw new Error("Bitte geben Sie eine gültige E-Mail Adresse ein.");

    let user = await User.findOne({ email: email });

    if (!user)
      throw new Error("User mit der eingegebenen E-Mail existiert nicht.");

    let token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    let verificationLink = `${process.env.FRONTEND_URL}/resetpassword?token=${token}`;
    let html =
      "Klicken Sie <a href='" +
      verificationLink +
      "'><span>hier</span></a>, um Ihr Passwort zu ändern.";

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "Passwort änderung Nisagram",
      html: html,
    };

    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      //todo -> pass in env speichern wenn möglich
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: "hxrm lcxe vjfr rucd",
      },
    });

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        throw new Error(err.message);
      }
    });
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const followGivenUserId = async (req) => {
  const _id = req.params._id;
  const authenticatedId = req._id;

  try {
    if (!_id)
      throw new Error("Bitte eine _id des zu folgenden User's angeben!");
    if (!authenticatedId)
      throw new Error("Sie sind nicht befugt, diese Aktion durchzuführen!");

    const userToFollow = await User.findById(_id);
    const authenticatedUser = await User.findById(authenticatedId);

    if (!userToFollow) throw new Error("Zu folgender User existiert nicht!");

    if (!authenticatedUser) throw new Error("User existiert nicht!");

    if (!authenticatedUser.following.includes(userToFollow._id)) {
      authenticatedUser.following.push(userToFollow._id);
      await authenticatedUser.save();
    }

    if (!userToFollow.followers.includes(authenticatedUser._id)) {
      userToFollow.followers.push(authenticatedUser._id);
      await userToFollow.save();
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const unfollowGivenUserId = async (req) => {
  const _id = req.params._id;
  const authenticatedId = req._id;

  try {
    if (!_id)
      throw new Error("Bitte eine _id des zu folgenden User's angeben!");
    if (!authenticatedId)
      throw new Error("Sie sind nicht befugt, diese Aktion durchzuführen!");

    const userToUnfollow = await User.findById(_id);
    const authenticatedUser = await User.findById(authenticatedId);

    if (!userToUnfollow) throw new Error("Zu entfolgender User existiert nicht!");

    if (!authenticatedUser) throw new Error("User existiert nicht!");

    authenticatedUser.following = authenticatedUser.following.filter(
      (followedId) => !followedId.equals(userToUnfollow._id)
    );
    await authenticatedUser.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => !followerId.equals(authenticatedUser._id)
    );
    await userToUnfollow.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const createNewUser = async (req) => {
  const { email, userID, password } = req.body;
  try {
    let verificationToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    let newUser = new User({
      email: email,
      password: password,
      userID: userID,
      verificationToken: verificationToken,
    });

    let verificationLink = `${process.env.FRONTEND_URL}/user/verify?token=${verificationToken}`;
    let html =
      "Klicken Sie <a href='" +
      verificationLink +
      "'><span>hier</span></a>, um Ihre E-Mail zu verifizieren.";

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "E-Mail verifikation Nisagram",
      html: html,
    };

    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: "hxrm lcxe vjfr rucd", // todo: aus Umgebungsvariablen lesen, wenn möglich
      },
    });

    await transporter.sendMail(mailOptions);
    let user = await newUser.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkGivenPassword = async (req) => {
  try {
    if (!req.body.password)
      throw new Error("Bitte füllen Sie alle Felder aus!");

    let user = await User.findById(req._id);
    if (!user) throw new Error("User existiert nicht!");

    let isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) throw new Error("Unkorrektes Passwort!");

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (req) => {
  try {
    let token = req.query.token;
    let password = req.body.password;
    let email = req.body.email;

    if (!token) throw new Error("Kein Zugriff ohne Token!");
    if (!password) throw new Error("Bitte geben Sie ein Passwort ein.");
    if (!email) throw new Error("Bitte geben Sie eine E-Mail ein.");

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) throw new Error("Zugriff verboten! Ungültiger Token.");
    });

    // Mindestens 8 Zeichen -> davon mindestens 2 Zahlen
    const regexPassword = new RegExp("^(?=.*[0-9].*[0-9]).{8,}$");

    if (!regexPassword.test(password))
      throw new Error(
        "Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Zahlen beinhalten."
      );
    let hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;

    let updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { password } },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findAndUpdateFromGivenId = async (req) => {
  try {
    const updatedData = req.body;

    if (updatedData._id) throw new Error("Sie können die _id nicht ändern!");

    if (req.file) {
      if (req.file.fieldname === "image") {
        updatedData.profilePicture = process.env.BASE_URL + "/static/profile/" + req.file.filename;
      } else if (req.file.fieldname === "banner") {
        updatedData.bannerPicture = process.env.BASE_URL + "/static/profile/banner/" + req.file.filename;
      }
    }

    const authenticatedId = req._id;
    const requestedId = req.params._id;

    if (!requestedId) throw new Error("Bitte geben Sie eine _id an.");

    if (authenticatedId !== requestedId) {
      throw new Error("Sie sind nicht befugt diese Aktion durchzuführen.");
    }

    // Mindestens 8 Zeichen -> davon mindestens 2 Zahlen
    const regexPassword = new RegExp("^(?=.*[0-9].*[0-9]).{8,}$");

    if (req.body.userID) {
      let user = await User.findOne({ userID: req.body.userID });
      if (user) throw new Error("UserID existiert bereits!");
    }

    let user = await User.findById(requestedId);
    if (!user) throw new Error("User existiert nicht!");
    else {
      if (updatedData.password) {
        if (!regexPassword.test(updatedData.password))
          throw new Error(
            "Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Zahlen beinhalten."
          );
        let hashedPassword = await bcrypt.hash(updatedData.password, 10);
        updatedData.password = hashedPassword;
      }

      let updatedUser = await User.findOneAndUpdate(
        { _id: requestedId },
        { $set: updatedData },
        { new: true }
      );
      return updatedUser;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyEmail = async (req) => {
  const token = req.query.token;

  try {
    if (!token) throw new Error("Zugriff verboten! Kein Token bereitgestellt.");

    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      { $set: { verified: true } }
    );
    if (!user) throw new Error("User existiert nicht.");
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  findAll,
  createNewUser,
  findSpecificUser,
  findUserByTerm,
  verifyEmail,
  findIfUserIsVerified,
  findIfUserIDExistsByTerm,
  findIfEMailExistsByTerm,
  findAndUpdateFromGivenId,
  checkGivenPassword,
  sendForgotPasswordMail,
  resetPassword,
  followGivenUserId,
  unfollowGivenUserId
};
