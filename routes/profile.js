const express=require("express")
const router=express.Router();

const session=require("express-session");

const profiles=require("../controller/profilecontroller");

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



// show profile
router.get("/",checkSessionAndBlocked,profiles.profileget);

// user addresss
router.get("/address",checkSessionAndBlocked,profiles.addressget);
// to get add address page
router.get("/addAddress",checkSessionAndBlocked,profiles.Addaddressget);
//to add address
router.post("/addressAdded",checkSessionAndBlocked,profiles.Addaddresspost);
//to delete user address
router.get("/deleteAddress/:id",checkSessionAndBlocked,profiles.deladdressget);


//to edit  address
router.get("/editAddress/:id",checkSessionAndBlocked,profiles.editaddressget);
router.post("/editedAddress/:id",checkSessionAndBlocked,profiles.editaddresspost);




//edit userdetails
router.get("/edituser/:id",checkSessionAndBlocked,profiles.edituserget);
router.post("/editeduser/:id",checkSessionAndBlocked,profiles.edituserpost);


//change password
router.get("/changepass",checkSessionAndBlocked,profiles.changepassget);
router.post("/changedpass",checkSessionAndBlocked,profiles.changepasspost);



router.get("/orders",checkSessionAndBlocked,profiles.ordersget);
router.get("/cancelord/:id/:productid",checkSessionAndBlocked,profiles.orderscanget);

router.get("/profileOTPget",profiles.otpget);
router.post("/profileOTPpost/:id",profiles.otppost)
router.post("/profileRndotp",profiles.resendotppost);


router.get("/ordersummary/:id/:productid",profiles.getOrderSum)

router.get("/invoice/:id/:productid",profiles.getInvoice);

router.get("/wallet",checkSessionAndBlocked,profiles.walletget);


module.exports=router;