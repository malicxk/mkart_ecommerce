const express=require("express");
const app=new express();

const userrouter=require("./routes/user")
const adminrouter=require("./routes/admin")
const cartrouter=require("./routes/cartr")
const profilerouter=require("./routes/profile");
const orderrouter=require("./routes/order")
const categoryrouter=require("./routes/category");
const productrouter=require("./routes/product");
const paymentrouter=require("./routes/paymentr");
const couponrouter=require("./routes/coupon");


const session=require("express-session");
const path=require("path");
const bodyparser=require("body-parser")

require("dotenv").config();


//model importing
const mongo=require("./mongo");


//no cache
const nocache=require("nocache");
app.use(nocache());


//Body parser
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

//EJS
app.set("view engine","ejs");
// app.set("views","./views/userviews");
// app.set("views","./views/adminviews")
app.set("views",["./views/userviews","./views/adminviews"]);



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));



//setting static assets
app.use("/",express.static(path.join(__dirname,"assets")));

//Routes
app.use("/",userrouter);
app.use("/admin",adminrouter);
app.use("/cart",cartrouter);
app.use("/profile",profilerouter);
app.use("/order",orderrouter);
app.use("/categorymanage",categoryrouter);
app.use("/productmanage",productrouter);
app.use("/payment",paymentrouter);
app.use("/coupon",couponrouter);



const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`server is running on the port ${PORT}`));