const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new mongoose.Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, 'Benutzer-ID ist erforderlich']
  },
  post: { 
    type: Schema.Types.ObjectId, 
    ref: "Post", 
    required: [true, 'Post-ID ist erforderlich'] 
  },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
