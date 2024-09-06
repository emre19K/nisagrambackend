const express = require("express");
const router = express.Router();
const authService = require("../services/authServices");
const userService = require("../services/userServices");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: A token for the user
 *         headers:
 *           Authorization:
 *             description: Bearer token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/login", async (req, res, next) => {
  try {
    let token = await authService.validateAndGiveToken(req);
    res.set("Authorization", "Bearer " + token);
    res.send({ token });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               userID:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Registrierung erfolgreich! Weiterleitung folgt...
 */
router.post(
  "/register",
  authService.validateRegisterInput,
  async (req, res, next) => {
    try {
      await userService.createNewUser(req);
      res.status(200).json("Registrierung erfolgreich! Weiterleitung folgt...");
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify user's email
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Email verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 OK:
 *                   type: string
 *                   example: E-Mail verifiziert!
 */
router.get("/verify", async (req, res, next) => {
  try {
    await userService.verifyEmail(req);
    res.status(200).json({ "OK:": "E-Mail verifiziert!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
