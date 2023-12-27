const express=require("express");
const router=express.Router();
const session=require('express-session')

const userm=require("../model/user");

const users=require("../controller/usercontroller");

router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));



const checkSessionAndBlocked=async(req,res,next)=>{
  if(req.session.userdet){
    const userDetails=await userm.findOne({email:req.session.userdet.email})
    if(userDetails && !userDetails.isBlocked){
      next();
    }else{
      req.session.destroy((err)=>{
        if(err){
          console.log("Error in destroying session:",err)
          res.redirect("/login")
        }else{
          res.redirect("/login");
        }
      })
    }
  }else{
    res.redirect("/login");
  }
}







//nocache
const nocache=require("nocache");
router.use(nocache());
const cache=require("nocache")

//home route
router.get("/",users.homeroute)

//login route
router.get("/login",users.loginget);
router.post("/login",users.loginpost);


//register route
router.get("/register",users.registerget);
router.post("/register",users.registerpost);

//userHome route
router.get("/userHome",checkSessionAndBlocked,users.homepageget);


// product detail page route
router.get("/productdet/:id",checkSessionAndBlocked,users.proddetget);


//otp page route
router.get("/otppage",users.otpget);
router.post("/otppage",users.otppost);
router.get("/resendotp",users.resendotpget);

//product detail page route
router.get("/productdet",checkSessionAndBlocked,users.prodget);

//shop page route
router.get("/shop",checkSessionAndBlocked,users.shopget);

router.get("/searchproducts",checkSessionAndBlocked,users.searchget);


//logout route
router.get("/logout",users.logoutuser)


module.exports=router;