const express = require("express");
const router = express.Router();
const likeService = require("../services/likeServices.js");
const { verifyToken } = require("../services/authServices.js");

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: API to manage likes.
 */

/**
 * @swagger
 * /likes/{postId}:
 *   post:
 *     summary: Like a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to like
 *     responses:
 *       200:
 *         description: The like information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                 post:
 *                   type: string
 *       404:
 *         description: Already liked
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Bereits geliked!
 */
router.post("/:postId", verifyToken, async (req, res, next) => {
  try {
    let like = await likeService.likePost(req);
    if (!like) {
      res.status(404).json("Bereits geliked!");
    } else {
      res.status(200).json(like);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /likes/{postId}:
 *   get:
 *     summary: Check if the post is liked
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to check
 *     responses:
 *       200:
 *         description: The like information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                 post:
 *                   type: string
 *       404:
 *         description: Not liked
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Nicht geliked!
 */
router.get("/:postId", verifyToken, async (req, res, next) => {
  try {
    let like = await likeService.hasLiked(req);
    if (!like) {
      res.status(404).json("Nicht geliked!");
    } else {
      res.status(200).json(like);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /likes/dislike/{postId}:
 *   post:
 *     summary: Dislike a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to dislike
 *     responses:
 *       200:
 *         description: Post disliked
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Beitrag gedisliked!
 */
router.post("/dislike/:postId", verifyToken, async (req, res, next) => {
  try {
    await likeService.dislikePost(req);
    res.status(200).json("Beitrag gedisliked!");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
