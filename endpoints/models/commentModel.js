const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Text ist erforderlich'],
    minlength: [1, 'Text darf nicht leer sein'],
    maxlength: [500, 'Text darf nicht länger als 500 Zeichen sein']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Benutzer-ID ist erforderlich']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: [true, 'Post-ID ist erforderlich']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
