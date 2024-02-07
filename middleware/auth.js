const jwt = require("jsonwebtoken");
require('dotenv').config();

//a middleware to check if token is valid, i.e the user is auth
module.exports = function (req, res, next) {
    //gets token, where x-auth-token is what I call the token in header
    const token = req.header("x-auth-token");

    //checks if there is a token
    if (!token) {
        return res.status(401).json({ msg: "No token, authorize denied"});
    }

    //tries to check if token is my jwt I gave and is not expired
    try{
        jwt.verify(token, process.env.jwtSecret, (error, decoded) => {
            if(error){
                return res.status(401).json({ msg: "token is not valid"});
            }
            else{
                req.user = decoded.user;
                next();
            }
        })
    }
    catch(err){
        console.error("Something went wrong in the server");
        return res.status(500).json({ msg: "Server Error"})
    }
}