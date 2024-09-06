const Post = require("../models/postModel");
const Like = require("../models/likeModel");

const likePost = async (req) => {
  const _id = req._id;
  const postId = req.params.postId;

  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");

    if (!postId) throw new Error("Bitte geben Sie eine postId an!");

    const existingLike = await Like.findOne({
      user: _id,
      post: postId,
    });

    if (existingLike) {
      return null;
    } else {
      const like = new Like({ user: _id, post: postId });
      let liked = await like.save();

      let post = await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
      if (!post) throw new Error("Beitrag existiert nicht!");
      return liked;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const hasLiked = async (req) => {
  const _id = req._id;
  const postId = req.params.postId;

  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");

    if (!postId) throw new Error("Bitte geben Sie eine postId an!");

    const existingLike = await Like.findOne({
      user: _id,
      post: postId,
    });

    if (existingLike) {
      return true;
    } else {
      return null
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const dislikePost = async (req) => {
  const _id = req._id;
  const postId = req.params.postId;

  try {
    if (!_id) throw new Error("Sie müssen Eingeloggt sein für diese Aktion!");

    if (!postId) throw new Error("Bitte geben Sie eine postId an!");

    const existingLike = await Like.findOne({
      user: _id,
      post: postId,
    });
    if (!existingLike) {
      throw new Error("Noch nicht geliked.");
    } else {
      await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
      await Like.findOneAndDelete({ post: postId, user: _id });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  likePost,
  dislikePost,
  hasLiked
};
