const express=require("express")
const router=express.Router();

const session=require("express-session");

const carts=require("../controller/cartcontroller");

const userm=require("../model/user");

router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

const nocache=require("nocache");
router.use(nocache());

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



//cart page rendering route
router.get("/",checkSessionAndBlocked,carts.cartpageget);


// adding product to the cart
router.get("/add/:id",checkSessionAndBlocked, carts.addtocartget);

//removing product from the cart
router.get("/remove/:id",checkSessionAndBlocked,carts.removecartget);

//product quantity adding from the cart
router.get("/addquantity/:id",checkSessionAndBlocked,carts.addquantityget);

// product quantity substracting from the cart
router.get("/subquantity/:id",checkSessionAndBlocked,carts.subquantityget);




//checkout routes
router.get("/checkout",checkSessionAndBlocked,carts.checkoutget);
router.post("/checkedout",checkSessionAndBlocked,carts.checkoutpost);




router.post("/usercoupon",checkSessionAndBlocked,carts.couponpost);

router.post("/walletpayment",carts.walletpay);



module.exports=router;
  
