const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId
    },

    items:[{
        id: {
            type: mongoose.Schema.Types.ObjectId
        },

        rating : {
            type: Number
        },
    
        title: {
            type: String
        },
    
        image : {
            type: String
        },
    
        tag: {
            type: String
        },
    
        price: {
            type: Number
        }
    }]
})

module.exports = mongoose.model('cart', cartSchema);