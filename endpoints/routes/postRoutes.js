const express = require("express");
const router = express.Router();
const PostService = require("../services/postServices.js");
const { verifyToken } = require("../services/authServices.js");
const uploadMiddleware = require("../../middlewares/uploadMiddleware");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API to manage posts.
 */

/**
 * @swagger
 * /posts/homepage:
 *   get:
 *     summary: Get posts for homepage
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts for homepage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   likes:
 *                     type: number
 *                   image:
 *                     type: string
 *                   author:
 *                     type: string
 */
router.get("/homepage", verifyToken, async (req, res, next) => {
  try {
    let posts = await PostService.findPostsForHomepage(req);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/{_id}:
 *   get:
 *     summary: Get posts from a given user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to get posts for
 *     responses:
 *       200:
 *         description: List of posts from the given user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   likes:
 *                     type: number
 *                   image:
 *                     type: string
 *                   author:
 *                     type: string
 */
router.get("/:_id", async (req, res, next) => {
  try {
    let posts = await PostService.findFromGivenUser(req);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/{_id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 likes:
 *                   type: number
 *                 image:
 *                   type: string
 *                 author:
 *                   type: string
 */
router.patch(
  "/:_id",
  uploadMiddleware.uploadPost.single("image"),
  verifyToken,
  async (req, res, next) => {
    try {
      const post = await PostService.findAndUpdateFromGivenId(req);
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /posts/{_id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Beitrag erfolgreich gelöscht.
 */
router.delete("/:_id", verifyToken, async (req, res, next) => {
  try {
    await PostService.findAndDeleteFromGivenId(req);
    res.status(200).json("Beitrag erfolgreich gelöscht.");
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Beitrag erfolgreich erstellt!
 */
router.post(
  "/create",
  verifyToken,
  uploadMiddleware.uploadPost.single("image"),
  uploadMiddleware.resizeImage,
  uploadMiddleware.addImageTags,
  async (req, res, next) => {
    try {
      await PostService.createPost(req);
      res.status(200).json("Beitrag erfolgreich erstellt!");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /posts/byterm/{term}:
 *   get:
 *     summary: Search posts by term
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to search posts by
 *     responses:
 *       200:
 *         description: List of posts matching the term
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   likes:
 *                     type: number
 *                   image:
 *                     type: string
 *                   author:
 *                     type: string
 */
router.get("/byterm/:term", verifyToken, async (req, res, next) => {
  try {
    let posts = await PostService.findPostsByTerm(req.params.term);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
