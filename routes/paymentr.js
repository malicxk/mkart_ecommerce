const express=require("express")
const router=express.Router();

const session=require("express-session");

const payments=require("../controller/paymentcontroller");

router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

const nocache=require("nocache");
router.use(nocache());



router.post("/razorpayment",payments.razorpost);



module.exports=router