const express=require("express");
const router=express.Router();
const path=require("path");
const session=require('express-session')


const coupons=require("../controller/couponcontroller");

//session middleware
router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));


  //nocache
const nocache=require("nocache");
router.use(nocache());

router.get("/",coupons.couponmanget);

router.get("/couponadd",coupons.addcouponget);
router.post("/addcoupon",coupons.addcouponpost);


router.get("/couponEdit/:id",coupons.editcoupget);//edit product routes
router.post("/editCoupon/:id",coupons.editcouppost);

module.exports=router;