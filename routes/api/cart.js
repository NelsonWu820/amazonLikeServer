const express = require("express");
const router = express.Router();
const Cart = require("../../models/Cart");
const Items = require("../../models/Items.js");
const History = require("../../models/History.js");
const auth = require("../../middleware/auth");
const mongoose = require('mongoose');
const {check, validationResult} = require("express-validator");

// @route GET api/cart
// @desc gets users cart info/id's of items added to cart
// @access Private
router.get("/", auth,
    async (req, res) => {
        const cart = await Cart.findOne({ user : req.user.id });
        try {
            //if use has no cart return [] for err messages
            if(!cart){
                res.json([]);
            }
            else{
                res.json(cart.items);
            }
        } catch (error) {
            console.error(error.message);
            return res.status(500).send("Server Error");
        }
    }
)

// @route PUT api/cart/:item_id
// @desc get or create a cart
// @access Private
router.put('/:item_id', auth, check('amount', 'Amount is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {amount} = req.body

        
        const item = await Items.findById(req.params.item_id);   
        
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }

        let newItem = {
            id: req.params.item_id,
            rating: item.rating,
            image: item.image,
            title: item.title,
            price: item.price,
            tag: item.tag
        };

        try {
            const userCart = await Cart.findOne({ user: req.user.id});
            //if there is no user cart
            if(!userCart){
                //create one 
                const newUserCart = new Cart({
                    user: req.user.id,
                })
                
                let answer = []
                for(let i = 0; i< amount; i++){
                    newUserCart.items.unshift(newItem)
                    answer.push({ ...newItem });
                }
    
                await newUserCart.save();
    
                res.json(answer);
            }
            else{
                //adds the same item to the beginning of Items array and answer for the redux state to have all 5
                let answer = []
                for(let i = 0; i< amount; i++){
                    userCart.items.unshift(newItem)
                    answer.push({ ...newItem });
                }
                
                await userCart.save();
        
                res.json(answer);
            }
    
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route DELETE api/cart/:item_id
// @desc delete's an item from cart
// @access Private
router.delete('/:id', auth, 
    async (req, res) => {
        try {
            //finds cart by user id
            const cart = await Cart.findOne({user: req.user.id});

            // Pull out item id from cart
            const item = cart.items.find(
                (item) => item._id.toString() === req.params.id.toString()
            );

            // Make sure item exists
            if (!item) {
                return res.status(404).json({ msg: 'Item does not exist' });
            };

            //deletes the item from cart
            cart.items = cart.items.filter(
                ({ _id }) => _id.toString() !== req.params.id.toString()
            );

            await cart.save();

            res.json(req.params.id);
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)

// @route GET api/cart/history
// @desc gets users history info
// @access Private
router.get("/history", auth,
    async (req, res) => {
        const history = await History.findOne({ user : req.user.id });
        try {
            res.json(history.history);
        } catch (error) {
            console.error(error.message);
            return res.status(500).send("Server Error");
        }
    }
)

// @route POST api/cart/history
// @desc adds everything to history then deletes it from cart db and state
// @access Private
//set a post because otherwise cart action call will, hit the put route for api/cart/:item_id
router.post('/history', auth,
    async (req, res) => {            
    
            try {
                const userHistory = await History.findOne({ user: req.user.id});

                //finds cart by user id so I can remove item
                const cart = await Cart.findOne({user: req.user.id});

                //if there is no user cart
                if(!userHistory){
                    //create one 
                    const newUserHistory = new History({
                        user: req.user.id,
                    })
                    
                    let answer = []
                    req.body.map((item) => {
                        let newItem = {
                            id: item.id,
                            rating: item.rating,
                            image: item.image,
                            title: item.title,
                            price: item.price,
                            tag: item.tag
                        };

                        newUserHistory.history.unshift(newItem);
                        
                        //not to get mixed up in cart find
                        let itemId = item._id;
                        // Pull out item id from cart
                        const itemCheck = cart.items.find(
                            (item) => item._id.toString() === itemId.toString()
                        );

                        // Make sure item exists
                        if (!itemCheck) {
                            return res.status(404).json({ msg: 'Item does not exist' });
                        };

                        //deletes the item from cart
                        cart.items = cart.items.filter(
                            ({ _id }) => _id.toString() !== itemId.toString()
                        );

                        answer.push({ ...newItem });
                    })
                    
                    await cart.save();
                    await newUserHistory.save();


        
                    res.json(answer);
                }
                else{
                    //adds the same item to the beginning of Items array and answer for the redux state to have all 5
                    let answer = []
                    req.body.map((item) => {
                        let newItem = {
                            id: item.id,
                            rating: item.rating,
                            image: item.image,
                            title: item.title,
                            price: item.price,
                            tag: item.tag
                        };
                        userHistory.history.unshift(newItem);

                        //not to get mixed up in cart find
                        let itemId = item._id;
                        // Pull out item id from cart
                        const itemCheck = cart.items.find(
                            (item) => item._id.toString() === itemId.toString()
                        );

                        // Make sure item exists
                        if (!itemCheck) {
                            return res.status(404).json({ msg: 'Item does not exist' });
                        };

                        //deletes the item from cart
                        cart.items = cart.items.filter(
                            ({ _id }) => _id.toString() !== itemId.toString()
                        );

                        answer.push({ ...newItem });
                    })
                    
                    await cart.save();
                    await userHistory.save();
            
                    res.json(answer);
                }
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ error : "Server Error"});
        }
    }
)


module.exports = router;
