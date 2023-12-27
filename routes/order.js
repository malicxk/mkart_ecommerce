const express=require("express")
const router=express.Router();

const session=require("express-session");

const orders=require("../controller/ordercontroller");

router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

const nocache=require("nocache");
router.use(nocache());


router.get("/",orders.ordermanget);

router.post("/orderpost/:id/:productid",orders.ordermanpost);
router.post("/orderdelete/:id",orders.orderdelpost);






module.exports=router  