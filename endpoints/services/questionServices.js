const User = require("../models/userModel");

const askQuestion = async (req) => {
  const _id = req._id;
  const { userId } = req.params;
  const { question } = req.body;
  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");
    if (!userId) throw new Error("Bitte geben Sie eine userId an!");
    if (!question) throw new Error("Bitte geben Sie eine Frage an!");

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User existiert nicht!");
    }
    user.questions.push({ question, askedBy: _id });
    await user.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getMyQuestions = async (req) => {
  const _id = req._id;
  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");
    const user = await User.findById(req._id).populate(
      "questions.askedBy",
      "userID"
    );
    return user.questions.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteQuestion = async (req) => {
  const _id = req._id;
  const { questionId } = req.params;
  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");
    if (!questionId) throw new Error("Bitte geben Sie eine questionId an!");

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User existiert nicht!");
    }
    user.questions.pop({ _id: questionId });
    await user.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const answerQuestion = async (req) => {
  const _id = req._id;
  const { questionId } = req.params;
  const { answer } = req.body;
  try {
    if (!_id) throw new Error("Sie müssen Eingelogged sein für diese Aktion!");
    if (!questionId) throw new Error("Bitte geben Sie eine questionId an!");
    if (!answer) throw new Error("Bitte geben Sie eine Antwort an!");

    const user = await User.findById(_id);
    const question = user.questions.id(questionId);
    if (!question) {
      throw new Error("Frage existiert nicht!");
    }
    user.answers.push({
      answer: answer,
      question: question.question,
    });
    await user.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserAnswers = async (req) => {
  const { userId } = req.params;
  try {
    if (!userId) throw new Error("Bitte geben Sie eine userId an!");
    const user = await User.findById(userId).populate(
      "userID"
    );
    const answeredQuestions = user.answers.sort((a, b) => b.createdAt - a.createdAt);
    return answeredQuestions;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getMyQuestions,
  getUserAnswers,
  answerQuestion,
  askQuestion,
  deleteQuestion,
};
