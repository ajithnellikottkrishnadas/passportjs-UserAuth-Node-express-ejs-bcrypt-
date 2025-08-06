import express from "express";
import bodyParser from "body-parser";
import connectDB from "./connectDB.js";
import userModel from "./userModel.js";
import nocache from "nocache";
import session from "express-session";
import bcrypt from "bcrypt"
import passport from "passport";
import { Strategy as localStrategy } from "passport-local";

const app = express();
const port = 3000;
const saltround = 10;

connectDB();

app.set("view engine", "ejs");
app.use(nocache());
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false, // for passport
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(async function verify(username, password, cb) {
  try {

    const user = await userModel.findOne({ username });
    if (!user)  return cb(null,false,{message: "incorrect username"});

    const isMatch= await bcrypt.compare(password, user.password);
    if(!isMatch) return cb(null, false,{message:"incorrect password"})

    return cb(null,user)
     
  } catch (error) {
    res.send(error)
  }
}))

passport.serializeUser((user,cb)=>{
  cb(null,user)
})

passport.deserializeUser((user,cb)=>{
  cb(null,user)
})

app.post("/login",passport.authenticate("local",{
  successRedirect: "/secrets",
  failureRedirect: "/login",
}))



app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login",  (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
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

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/login");
})

app.get("/secrets", (req, res) => {
  // console.log(req.user) => can access user data from login  
  res.render("secrets.ejs");
})


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/* import express from "express";
import bodyParser from "body-parser";
import connectDB from "./connectDB.js";
import userModel from "./userModel.js";
import nocache from "nocache";
import session from "express-session";
import bcrypt from "bcrypt"
const saltround = 10;

const app = express();
const port = 3000;
app.set("view engine", "ejs");

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
function userCheckSession(req,res,next){
  if (req.session.user) {
    res.render("secrets");
  } else {
    next();
  }
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", userCheckSession,(req, res) => {
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
    if (!isMatch) return res.render("login.ejs");
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
 */