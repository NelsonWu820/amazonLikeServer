const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const History = require("../../models/History.js");
const Items = require("../../models/Items.js");
const Cart = require("../../models/Cart");
const { check, validationResult } = require("express-validator");

// @route GET api/profile
// @desc gets the users profile info
// @access Private
router.get("/me", auth, async (req, res) => {
    try {
        //find profile by the id which is created in the auth middleware
        const profile = await Profile.findOne({user : req.user.id}).populate("user", ["name", "avatar"]);
        
        //checks if profile has a user
        if (!profile){
            return res.status(400).json({ "msg" : "There is no profile for this user"});
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server Error");
    }
})

// @route POST api/profile
// @desc edits a profiles info or creates it
// @access Private
router.post("/edit", auth, 
    check("address", "Please input a valid address").isLength({ min: 6 }).isString(),
    async (req, res) => {
        //checks validation
        const check = validationResult(req);
        if (!check){
            return res.status(400).json({ errors: "Send valid address"});
        }

        //updates the profile
        const { address, card1, card2, card3, sex, age } = req.body;
        //create the profile
        const profileField = {
            user : req.user.id,
            address: address,
            card1 : card1,
            card2 : card2,
            card3 : card3,
            sex : sex,
            age : age
        }
        //actually updates the profile and creates new profile if none are found
        try {
            const profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set : profileField},
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            return res.json(profile);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route DELETE api/profile
// @desc Deletes profile, history, cart, comments, and user
// @access Private
router.delete("/", auth, 
    async (req, res) => {
        try {

            const items = await Items.find({}).select("comments");
            const user = req.user.id;

            //pulls the user comments from every item if they have
            for (const item of items) {
                await Items.updateOne({ _id: item._id }, { $pull: { comments: { user } } });
            }           
            
            await Promise.all([
                //deletes all
                History.findOneAndDelete({ user: user}),
                Cart.findOneAndDelete({ user: user}),
                Profile.findOneAndDelete({ user: user}),
                User.findOneAndDelete({ _id: user})
            ])
            return res.json({ msg: "User Deleted"})
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

module.exports = router;