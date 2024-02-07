const mongoose = require("mongoose");

//checks if the id passed in is a legit mongoDB object id
const checkObjectID = (id) => (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[id])){
        return res.status(400).json({ msg: "Invalid ID"});
    }
    next();
}

module.exports = checkObjectID;