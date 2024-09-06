const express = require("express");
const { verifyToken } = require("../services/authServices");
const router = express.Router();
const commentService = require("../services/commentServices");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API to manage comments.
 */

/**
 * @swagger
 * /comments/{postId}:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 user:
 *                   type: string
 *                 post:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
router.post("/:postId", verifyToken, async (req, res, next) => {
  try {
    let comment = await commentService.createNewComment(req, res);
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to get comments for
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *                   user:
 *                     type: string
 *                   post:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/:postId", async (req, res, next) => {
  try {
    const comments = await commentService.getAllCommentsFromGivenPostId(
      req,
      res
    );
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
