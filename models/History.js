const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId
    },

    history :[{
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

module.exports = mongoose.model('history', historySchema);