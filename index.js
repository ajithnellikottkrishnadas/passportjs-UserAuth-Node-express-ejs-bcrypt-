import express from "express";
import bodyParser from "body-parser";
import connectDB from "./connectDB.js";
import userModel from "./userModel.js";
import nocache from "nocache";
import session from "express-session";
import bcrypt from "bcrypt"
const saltround = 10;

const app = express();
const port = 3000;

connectDB();
app.use(nocache());
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))


function isAuthenticated(req,res,next){
    if(req.session.user){
      next();
    }else{
      res.redirect("/login");
    }
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/login", async (req, res) => {

  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) return res.render("login.ejs");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) res.render("login.ejs");
    req.session.user = true;
    res.redirect("/secrets");
  } catch (error) {
    res.send(error)
  }

});

app.post("/register", async (req, res) => {
  try {

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltround);

    const userCheck = await userModel.findOne({ username });

    if (userCheck) {
      return res.render("login.ejs")
    } else {
      const newUser = new userModel({
        username,
        password: hashedPassword
      });
      await newUser.save();
      res.render("login.ejs");
    }
  } catch (error) {
    res.send(error);
  }
})

app.get("/logout",(req,res)=>{
  req.session.user=null;
  res.redirect("/login");
})

app.get("/secrets",isAuthenticated, (req,res)=>{
  res.render("secrets.ejs");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
