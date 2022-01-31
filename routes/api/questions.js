const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


//Load Person Model
const Person = require ('../../models/Person');

//Load Profile Models
const Profile = require ('../../models/Profile');

//Load Question models
const Question = require ('../../models/Question');

//@type GET
//@route /api/questions/
//@desc  route for showing all questions
//@ access Public
router.get("/", (req, res) => {
    Question.find()
    .sort("-date")
    .then(questions => res.json(questions))
    .catch(err => res.json({noquestions: "no questions to display!"}));
});

//@type post
//@route /api/questions/
//@desc  route for submission of questions
//@ access PRIVATE

router.post('/',passport.authenticate('jwt', {session: false}), (req, res) =>{
    const newQuestion = new Question({
        textone: req.body.textone,
        texttwo: req.body.texttwo,
        user: req.user.id,
        name: req.body.name
    });
    newQuestion.save()
    .then(question => res.json(question))
    .catch(err => console.log("Unable to push question to db" + err));
});

//@type post
//@route /api/answers/:id
//@desc  route for submission of answers to questions
//@ access PRIVATE

router.post('/answers/:id', 
passport.authenticate("jwt", { session: false }),
 (req, res) => {
    Question.findById(req.params.id)
    .then( question => {
        const newAnswer = {
            user: req.user.id,
            name: req.body.name,
            answer: req.body.answer
        };
        question.answers.push(newAnswer);

        question.save()
        .then(question => res.json(question))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

//@type post
//@route /api/questions/upvote/:id
//@desc  route for upvoting
//@ access PRIVATE

router.post('/upvote/:id', 
passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id})
    .then(profile => {
        Question.findById(req.params.id)
        .then(question => {
            if (question.upvotes.filter(
                upvote => upvote.user.toString() === req.user.id.toString()
                ).length > 0
                ) {
                    return res.status(400).json({noupvote: "User already upvoted"})
                    ;
            }
            question.upvotes.push({user: req.user.id})
            question
            .save()
            .then(question => res.json(question))
            .catch(error => {console.log(error)});
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});


module.exports = router;