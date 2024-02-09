const express = require("express");
const router = express.Router();
const Items = require("../../models/Items.js");
const User = require("../../models/User.js");
const auth = require("../../middleware/auth.js");
const checkObjectID = require("../../middleware/checkObjectID.js");
const {check, validationResult} = require("express-validator");

// @route GET api/items
// @desc gives a list of items  
// @access Public
router.get("/", 
    async (req, res) => {
        console.log(res.json(items))
        //should get all items
        const items = await Items.find({});
        try {
            return res.json(items);
        } catch (err) {
            console.log(res.json(items))
            console.error(err.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route GET api/items/search/:tag
// @desc gives a list of items with a certain tag  
// @access Public
router.get("/search/:tag", 
    async (req, res) => {
        //gets all items with the tag
        const item = await Items.find({tag: req.params.tag});
        try {
            return res.json(item);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route GET api/items/:id
// @desc gives an item by id  
// @access Public
router.get("/:id",
    async (req, res) => {
        //should get all items
        try {
            const item = await Items.findById(req.params.id);   

            if (!item) {
                return res.status(404).json({ msg: 'Item not found' });
            }

            return res.json(item);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route PUT api/items/comments/:id
// @desc adds a comment with a star rating and text since no update comment
// @access Private
router.post("/comments/:id", auth, checkObjectID("id"), 
    check("text", "Please input a comment").notEmpty(),
    check("rating", "Please input a rating from 1 to 5").isFloat({ min: 1, max: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            //finds item through id in header then populates
            const item = await Items.findById(req.params.id);
            const user = await User.findById(req.user.id).select("-password");

            const newComment = {
                user: req.user.id,
                name: user.name,
                text: req.body.text,
                rating: req.body.rating,
                avatar: user.avatar
            };

            item.comments.unshift(newComment);

            //In a bigger application I would not place the averaging here, and would place it into a seperate function that runs periodically 
            //finds the average rating of comment 
            let total = 0;
            let length = 0;
            item.comments.map((comment) => {
                total += comment.rating;
                length++;
            }) 
            //sets rating to average also rounds down 
            item.rating = Math.round(total/ (length));

            await item.save();

            res.json(item.comments);
        } catch (err) {   
            console.error(err.message);
            return res.status(500).send("Server Error" );
        }
    }
)

// @route DELETE api/items/comments/:item_id/:comment_id
// @desc deletes a comment with item_id/comment_id
// @access Private
router.delete("/comments/:item_id/:comment_id", auth,
    async (req, res) => {
        const item = await Items.findById(req.params.item_id);
        try {

            const comment = item.comments.find(
                (comment) => comment.id === req.params.comment_id
            );

            //if there is a comment with that id
            if(!comment){
                return res.status(400).json({ errors: "Comment not found"});
            }

            //checks if user is the comments poster
            if(req.user.id !== comment.user.toString()){
                return res.status(400).json({ errors: "Not authorized"});
            }

            item.comments = item.comments.filter(
                ({ id }) => id !== req.params.comment_id
            );

            await item.save();

            res.json(req.params.comment_id);

        } catch (err) {
            console.error(err.message);
            return res.status(500).send("Server Error" );
        }
    }
)

module.exports = router;