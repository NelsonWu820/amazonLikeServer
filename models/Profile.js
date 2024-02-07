const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    address: {
        type: String,
        required: true
    },

    card1 : {
        type: Number 
    },

    card2 : {
        type: Number 
    },

    card3 : {
        type: Number 
    },

    sex: {
        type: String
    },

    age : {
        type: Number
    }

})

module.exports = mongoose.model("profile", ProfileSchema);