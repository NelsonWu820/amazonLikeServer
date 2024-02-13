require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const path = require('path');
const cors = require('cors');

const app = express();

const corsOptions ={
  origin:"https://amazon-like-frontend-ky41k0aer-nelsonwu820s-projects.vercel.app", 
  methods: ["POST", "GET", "DELETE", "PUT"],
  credentials:true,           
  optionSuccessStatus:200
}

//code for vercel deployment
app.use(cors(corsOptions));

//connect to db
connectDB();

//lets middleware run byt initalizing it
app.use(express.json());

//routes defined
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/cart", require("./routes/api/cart"));
app.use("/api/items", require("./routes/api/items"));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
// Set static folder
    app.use(express.static('client/build'));
  
    //gets the index.html from client/build
    //for vercel deployment
    app.get('/', (req, res) => {
      res.json("works")
      //res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

//checks for open port if none set to 5000 by default
const PORT =  "https://amazon-like-frontend-ky41k0aer-nelsonwu820s-projects.vercel.app" || process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));

//for vercel to turn Express into serveless function
module.exports = app;