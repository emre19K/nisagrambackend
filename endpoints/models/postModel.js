const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titel ist erforderlich'],
    minlength: [1, 'Titel darf nicht leer sein'],
    maxlength: [200, 'Titel darf nicht länger als 200 Zeichen sein']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes können nicht negativ sein']
  },
  image: {
    type: String,
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: props => `${props.value} ist keine gültige Bilddatei!`
    }
  },
  author: {
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, 'Author ist erforderlich']
  },
  tags: {
    type: String, // Change to String to store a single description
    default: ''
  },
});

const Post = mongoose.model("Post", postsSchema);

module.exports = Post;
