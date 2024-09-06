const Post = require("../models/postModel");
const User = require("../models/userModel");
require("dotenv").config();

const ENV = process.env.ENV

// Function to find posts from a given user
const findFromGivenUser = async (req) => {
  const _id = req.params._id;

  try {
    if (!_id) throw new Error("Bitte eine _id angeben!");

    let posts = await Post.find({ author: _id })
      .sort({ createdAt: -1 })
      .populate("author", "userID")
      .exec();
    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to calculate the score for each post
const calculatePostScore = (post, user) => {
  const engagementWeight = 0.5;
  const recencyWeight = 0.4;
  const followingWeight = 0.3;
  const popularityWeight = 0.2;

  // Engagement score based on likes and comments
  const engagementScore =
    post.likes + (post.comments ? post.comments.length : 0) * 2;

  // Recency score using a logistic decay function
  const postAgeInHours =
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const recencyScore = 1 / (1 + Math.exp(postAgeInHours / 20)); // Using k = 20 for slower decay

  // Following score: higher if the current user follows the post's author
  const followingScore = user.following.includes(post.author._id) ? 100 : 0;

  // Popularity score based on the number of followers the author has
  const authorPopularityScore =
    (post.author.followers ? post.author.followers.length : 0) * 0.1;

  // Calculate the final score by combining all weighted scores
  const finalScore =
    engagementScore * engagementWeight +
    recencyScore * recencyWeight +
    followingScore * followingWeight +
    authorPopularityScore * popularityWeight;

  return finalScore;
};

const findPostsForHomepage = async (req) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const _id = req._id; // Current logged-in user's ID

    if (!_id)
      throw new Error("Sie sind nicht befugt diese Aktion durchzuführen!");

    // Fetch current user data and populate followed users
    const user = await User.findById(_id).populate("following");
    if (!user) throw new Error("User existiert nicht!");

    const skip = (page - 1) * limit;

    // Fetch posts from followed users
    let posts = await Post.find({ author: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate("author", "userID profilePicture") // Ensure author information is populated
      .exec();

    console.log("Fetched posts from followed users:", posts);

    // If not enough posts, fetch additional posts from other users
    if (posts.length < limit) {
      const additionalPosts = await Post.find({
        author: { $nin: user.following },
      })
        .sort({ createdAt: -1 })
        .populate("author", "userID profilePicture") // Ensure author information is populated
        .exec();

      posts = posts.concat(additionalPosts);
    }

    // Calculate scores for each post and add the score to the post object
    posts.forEach((post) => {
      post.score = calculatePostScore(post, user);
    });

    // Sort posts by score in descending order
    posts.sort((a, b) => b.score - a.score);

    // Implement pagination
    const paginatedPosts = posts.slice(skip, skip + limit);

    console.log("Paginated posts with author data:", paginatedPosts);

    return paginatedPosts;
  } catch (error) {
    console.error("Error in findPostsForHomepage:", error.message);
    throw new Error(error.message);
  }
};

// Function to update a post by its ID
const findAndUpdateFromGivenId = async (req) => {
  const updatedData = { title: req.body.title };
  const _id = req.params._id;

  const post = await Post.findById(_id);
  const authenticatedId = req._id;
  const authorId = post.author.toString();

  if (authorId !== authenticatedId)
    throw new Error("Sie sind nicht befügt diese Aktion durchzuführen!");

  if (req.file) {
    updatedData.image =
      process.env.BASE_URL + "/static/posts/" + req.file.filename;
  }

  try {
    if (!_id) throw new Error("Bitte eine _id angeben.");

    let updatedPost = await Post.findByIdAndUpdate(
      _id,
      { $set: updatedData },
      { new: true }
    );
    return updatedPost;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to delete a post by its ID
const findAndDeleteFromGivenId = async (req) => {
  const _id = req.params._id;

  try {
    if (!_id) throw new Error("Bitte eine _id angeben.");

    const post = await Post.findById(_id);
    const authenticatedId = req._id;
    const authorId = post.author.toString();

    if (authorId !== authenticatedId)
      throw new Error("Sie sind nicht befügt diese Aktion durchzuführen!");

    let user = await User.findById(authenticatedId);
    if (!user) throw new Error("User existiert nicht!");

    user.posts = user.posts - 1;
    await user.save();

    await Post.findByIdAndDelete(_id);
  } catch (error) {
    throw new Error(error.message);
  }
};
// Function to create a new post
const createPost = async (req) => {
  try {
    const authenticatedId = req._id;

    if (!authenticatedId)
      throw new Error("Sie sind nicht befugt diese Aktion durchzuführen.");

    if (!req.body.title) {
      throw new Error("Bitte fügen Sie eine Beschreibung hinzu.");
    }

    if (!req.file) {
      throw new Error("Bitte fügen Sie eine Foto hinzu.");
    }

    let user = await User.findById(authenticatedId);
    if (!user) throw new Error("User existiert nicht!");

    user.posts = user.posts + 1;
    await user.save();

    let image = process.env.BASE_URL + "/static/posts/" + req.file.filename;
    let title = req.body.title;

    let tags;
    let newPost;

    if (ENV) {
      newPost = new Post({
        title: title,
        image: image,
        author: authenticatedId,
      });
    } else {
      tags = req.body.tags || []; // Ensure tags are processed

      newPost = new Post({
        title: title,
        image: image,
        author: authenticatedId,
        tags: tags, // Save the tags to the post
      });
    }

    await newPost.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to find posts by term
const findPostsByTerm = async (term) => {
  try {
    const regex = new RegExp(term, "i"); // Case-insensitive regex
    const posts = await Post.find({ tags: { $regex: regex } }).limit(25);
    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createPost,
  findFromGivenUser,
  findAndUpdateFromGivenId,
  findAndDeleteFromGivenId,
  findPostsByTerm,
  findPostsForHomepage,
};
