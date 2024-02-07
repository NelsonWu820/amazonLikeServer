const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// @route POST api/user
// @desc signs up the user if the email is not used and is a valid with its gravatar and inputs it into mongodb
// @access Public
router.post("/",
    check("name", "Please input a valid name").notEmpty(),
    check("email", "Please input a valid email address").isEmail(),
    check("password", "Please input a password at least 6 characters long").isLength({ min: 6 }),
    async (req, res) => {
        //check for errors above
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        
        //sends user data to mongodb through Schema
        //takes it out from body
        const { email, password, name } = req.body;
        try {
    
            // check if email is unique 
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            //sets gravatar 
            const avatar = gravatar.url(email, {
                  s: '200',
                  r: 'pg',
                  d: 'mm'
            })
              
    
            //fill in the user Schema/ primes it
            user = new User({
                name,
                email,
                password,
                avatar
            })
            
            //sets password saved to encrypted password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);

            //then saves it actually
            await user.save();

            //creates jwt and stores it
            //get user id
            const payload = {
                user: {
                    id: user.id
                }
            };

            //creates jwt
            jwt.sign( payload, process.env.jwtSecret, {expiresIn: "5 days" }, (err, token) => {
                if (err) throw err;
                res.json({token});
            })

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ errors: "Server Error"});
        }
    }
)

module.exports = router;