const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");

const createNewComment = async (req) => {
  const postId = req.params.postId;
  const text = req.body.text;

  try {
    if (!postId) throw new Error("Bitte geben Sie eine _id an.");
    if (!text)
      throw new Error("Bitte fügen Sie einen Text für Ihr kommentar ein.");
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Beitrag existiert nicht!");
    }

    const user = await User.findById(req._id);
    if (!user) {
      throw new Error("User existiert nicht.");
    }

    const comment = new Comment({
      text: text,
      user: user._id,
      post: postId,
    });

    let created = await comment.save();
    created = await Comment.findById(created._id)
     .populate({
      path: 'user',
      select: 'userID profilePicture'
    })
      .exec();
    return created;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllCommentsFromGivenPostId = async (req) => {
  const postId = req.params.postId;

  try {
    if (!postId) throw new Error("Bitte geben Sie eine _id an.");
    const comments = await Comment.find({ post: req.params.postId }).populate({
      path: 'user',
      select: 'userID profilePicture'
    });
    return comments;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createNewComment,
  getAllCommentsFromGivenPostId,
};
