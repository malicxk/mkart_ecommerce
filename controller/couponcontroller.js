const express=require("express");
const app=new express();
const session=require("express-session");


const products=require("../model/products");
const category=require("../model/category");
const userm=require("../model/user");
const profilem=require("../model/profilem");
const cartm=require("../model/cartm");
const profilepicm=require("../model/profilepicm");
const orderm=require("../model/orderm");
const addressm=require("../model/addressm");
const couponm=require("../model/couponm");


const nocache=require("nocache");
const coupon = require("../model/couponm");
app.use(nocache());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));


const controls={
    couponmanget:async(req,res)=>{
      if (req.session.admindata) {
        try {
            const coupons = await couponm.find();
            res.render("couponpage", { coupons });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
      }else{
        res.redirect("/admin");
      }
    },

    
    addcouponget:async(req,res)=>{
        
    },

    addcouponpost:async(req,res)=>{
        const coupondata={
            couponcode:req.body.couponcode,
            discount:req.body.discount,
            expirydate:req.body.expirydate,
            purchaseamount:req.body.purchaseamount
        }
          console.log(coupondata);
          try{
            const result=await couponm.insertMany([coupondata]);
            console.log("Inserted",result);
            res.redirect("/coupon");
          }
          catch(error){
            console.log(error);
            res.status(500).send("Internal Sever Error");
          }
    },

    editcoupget:async(req,res)=>{

    },

    editcouppost:async(req,res)=>{
        const couponId = req.params.id;

        const updatedCoupon = {
        couponcode: req.body.editCouponCode,
        discount: req.body.editDiscount,
        expirydate: req.body.editExpiryDate,
        purchaseamount: req.body.editPurchaseAmount
        };

        try {
        const result = await couponm.findByIdAndUpdate(couponId, updatedCoupon, { new: true });
        console.log("Updated Coupon:", result);
        res.redirect("/coupon");
        } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
        }
    }
}

module.exports=controls;