const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/myurl');



router.get('/', (req,res) => 
    res.json({ test: "Auth is being tested" }));

// import schema for Person to Register
const Person = require("../../models/Person");
const { response } = require('express');

//@type POST
//@route /api/auth/login
//@desc  route for login of users
//@ access PUBLIC

router.post('/register', (req,res) => {

    Person.findOne({ email: req.body.email})
    .then( person => {
        if (person) {
            return res
            .status(400)
            .json({emailerror: 'Email already exists in our Database!'});
        } else {
                const newPerson = new Person({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                //encrypt password using bcryptjs
                    bcrypt.genSalt(10, (err, salt) => {
                      bcrypt.hash(newPerson.password, salt, (err, hash) => {
                          if (err) throw err;
                          newPerson.password = hash;
                          newPerson.save()
                          .then( person => res.json(person))
                          .catch(err => console.log(err))
                      });  
                    });
            }
        })
    .catch(err => console.log(err));
});

//@type POST
//@route /api/auth/login
//@desc  route for login of users
//@ access PUBLIC

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({email})
    .then( person => {
        if (!person){
            return res.status(404).json({emailerror: 'User not found'});
        }
        bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
            if(isCorrect){
                // res.json({success: 'User can login successfully'});
                //use payload and create token for user
                const payload = {
                    id: person.id,
                    name: person.name,
                    email: person.email
                };
                jsonwt.sign(
                    payload,
                    key.secret,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                res.status(400).json({passworderror: 'Invalid password'});
            }
        })
        .catch(err => console.log(err));
        
    })
    .catch(err => console.log(err));
});

//@type GET
//@route /api/auth/profile
//@desc  route for user profile
//@ access PRIVATE

router.get(
    "/profile",
     passport.authenticate('jwt', {session: false}),
 (req, res) => {
    // console.log(req);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profile: req.user.profilepic
        })
    }
);


module.exports = router;