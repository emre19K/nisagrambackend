const express = require("express");
const router = express.Router();
const UserService = require("../services/userServices.js");
const { verifyToken } = require("../services/authServices.js");
const uploadMiddleware = require("../../middlewares/uploadMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API to manage users.
 */

/**
 * @swagger
 * /users/{_id}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to get
 *     responses:
 *       200:
 *         description: The user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 userID:
 *                   type: string
 */
router.get("/:_id", async (req, res, next) => {
  try {
    let user = await UserService.findSpecificUser(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/follow/{_id}:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 followers:
 *                   type: number
 */
router.post("/follow/:_id", verifyToken, async (req, res, next) => {
  try {
    let followed = await UserService.followGivenUserId(req);
    res.status(200).json(followed);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/unfollow/{_id}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 followers:
 *                   type: number
 */
router.post("/unfollow/:_id", verifyToken, async (req, res, next) => {
  try {
    let unfollowed = await UserService.unfollowGivenUserId(req);
    res.status(200).json(unfollowed);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/checkverification/{userID}:
 *   get:
 *     summary: Check if user is verified
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: The userID to check verification status for
 *     responses:
 *       200:
 *         description: User is verified
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User ist verifiziert!
 *       400:
 *         description: Email is not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: E-Mail ist nicht verifiziert.
 */
router.get("/checkverification/:userID", async (req, res, next) => {
  try {
    const isVerified = await UserService.findIfUserIsVerified(req);
    if (isVerified) {
      res.status(200).json("User ist verifiziert!");
    } else {
      res.status(400).json("E-Mail ist nicht verifiziert.");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/description/{_id}:
 *   patch:
 *     summary: Update user description
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update description for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.patch(
  "/description/:_id",
  verifyToken,
  async (req, res, next) => {
    try {
      const user = await UserService.findAndUpdateFromGivenId(req);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/image/{_id}:
 *   patch:
 *     summary: Update user profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update profile image for
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
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 image:
 *                   type: string
 */
router.patch(
  "/image/:_id",
  verifyToken,
  uploadMiddleware.uploadProfile.single("image"),
  async (req, res, next) => {
    try {
      const user = await UserService.findAndUpdateFromGivenId(req);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/banner/{_id}:
 *   patch:
 *     summary: Update user banner image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update banner image for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 banner:
 *                   type: string
 */
router.patch(
  "/banner/:_id",
  verifyToken,
  uploadMiddleware.uploadBanner.single("banner"),
  async (req, res, next) => {
    try {
      const user = await UserService.findAndUpdateFromGivenId(req);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/{_id}:
 *   patch:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               email:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 email:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.patch("/:_id", verifyToken, async (req, res, next) => {
  try {
    const user = await UserService.findAndUpdateFromGivenId(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/checkpassword:
 *   post:
 *     summary: Check user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Passwort gültig.
 */
router.post("/checkpassword", verifyToken, async (req, res, next) => {
  try {
    await UserService.checkGivenPassword(req);
    res.status(200).json("Passwort gültig.");
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/forgotpassword:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: E-Mail gesendet!
 */
router.post(
  "/forgotpassword",
  async (req, res, next) => {
    try {
      await UserService.sendForgotPasswordMail(req);
      res.status(200).json("E-Mail gesendet!");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/resetpassword:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 OK:
 *                   type: string
 *                   example: Passwort geändert.
 */
router.post(
  "/resetpassword",
  async (req, res, next) => {
    try {
      await UserService.resetPassword(req);
      res.status(200).json({ OK: "Passwort geändert." });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /users/byterm/{term}:
 *   get:
 *     summary: Find user by term
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to search for
 *     responses:
 *       200:
 *         description: The user found by term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 email:
 *                   type: string
 */
router.get("/byterm/:term", verifyToken, async (req, res, next) => {
  try {
    let user = await UserService.findUserByTerm(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/checkuserid/{term}:
 *   get:
 *     summary: Check if user ID exists
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to check for user ID existence
 *     responses:
 *       200:
 *         description: User ID check result
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 */
router.get("/checkuserid/:term", async (req, res, next) => {
  try {
    let isFree = await UserService.findIfUserIDExistsByTerm(req);
    res.status(200).json(isFree);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/checkuseremail/{term}:
 *   get:
 *     summary: Check if user email exists
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: The term to check for user email existence
 *     responses:
 *       200:
 *         description: User email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 */
router.get(
  "/checkuseremail/:term",
  async (req, res, next) => {
    try {
      let user = await UserService.findIfEMailExistsByTerm(req);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;