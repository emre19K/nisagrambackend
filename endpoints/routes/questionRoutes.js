// routes/questions.js
const express = require('express');
const router = express.Router();
const questionService = require("../services/questionServices.js")
const { verifyToken } = require("../services/authServices.js");

router.post('/ask/:userId', verifyToken, async (req, res, next) => {
    try {
        await questionService.askQuestion(req);
        res.status(200).json("");
    } catch (error) {
        next(error);
    }
});

router.get('/my-questions', verifyToken, async (req, res, next) => {
    try {
        let questions = await questionService.getMyQuestions(req);
        res.status(200).json(questions);
    } catch (error) {
        next(error);
    }
});

router.post('/answer/:questionId', verifyToken, async (req, res, next) => {
    try {
        await questionService.answerQuestion(req);
        res.status(200).json("");
        
    } catch (error) {
        next(error);
    }
});

router.delete('/delete/:questionId', verifyToken, async (req, res, next) => {
    try {
        await questionService.deleteQuestion(req);
        res.status(200).json("");
    } catch (error) {
        next(error);
    }
});

router.get('/answers/:userId', verifyToken, async (req, res, next) => {
    try {
        let answers = await questionService.getUserAnswers(req);
        res.status(200).json(answers);
    } catch (error) {
        next(error);
    }
});

module.exports = router;


