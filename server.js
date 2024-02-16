require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const path = require('path');
const cors = require('cors');

const app = express();


//code for vercel deployment
app.use(cors({
    origin:"https://amazon-like-frontend.vercel.app", 
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials:true
}));

//connect to db
connectDB();

app.get('/', (req, res) => {
  res.json(["one", "two", "three"])
});

//lets middleware run byt initalizing it
app.use(express.json());

//routes defined
app.use("/auth", require("./routes/api/auth"));
app.use("/users", require("./routes/api/users"));
app.use("/profile", require("./routes/api/profile"));
app.use("/cart", require("./routes/api/cart"));
app.use("/items", require("./routes/api/items"));

// Serve static assets in production
/*if (process.env.NODE_ENV === 'production') {
// Set static folder
    app.use(express.static('client/build'));
  
    //gets the index.html from client/build
    //for vercel deployment
    /*
    app.get('/', (req, res) => {
      //res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}*/

//checks for open port if none set to 5000 by default
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));


//for vercel to turn Express into serveless function
module.exports = app;