const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const profileURL = process.env.profileURL || "http://localhost:8000"
const bannerURL = process.env.bannerURL || "http://localhost:8000"

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const AnswerSchema = new mongoose.Schema(
  {
    answer: { type: String, required: true },
    question: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema({
  questions: [QuestionSchema],
  answers: [AnswerSchema],
  email: {
    type: String,
    required: [true, "E-Mail ist erforderlich"],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    ],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Passwort ist erforderlich"],
    match: [
      /^(?=.*[0-9].*[0-9]).{8,}$/,
      "Das Passwort muss mindestens 8 Zeichen lang sein und mindestens 2 Zahlen beinhalten.",
    ],
  },
  profilePicture: {
    type: String,
    default: `${profileURL}/static/profile/default.png`,
    validate: {
      validator: function (v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: (props) => `${props.value} ist keine gültige Bilddatei!`,
    },
  },
  bannerPicture: {
    type: String,
    default: `${bannerURL}/static/profile/banner/default_banner.png`,
    validate: {
      validator: function (v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: (props) => `${props.value} ist keine gültige Bilddatei!`,
    },
  },
  userID: {
    type: String,
    required: [true, "Benutzer-ID ist erforderlich"],
    unique: true,
    minlength: [1, "Benutzer-ID muss mindestens 1 Zeichen lang sein"],
    maxlength: [50, "Benutzer-ID darf nicht länger als 50 Zeichen sein"],
  },
  description: {
    type: String,
    default: "Profil-Beschreibung unter Einstellungen hinzufügen",
    maxlength: [200, "Beschreibung darf nicht länger als 200 Zeichen sein"],
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: {
    type: Number,
    default: 0,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
  } catch (err) {
    return next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
