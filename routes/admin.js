const express=require("express");
const router=express.Router();
const path=require("path");
const session=require('express-session')

const admins=require("../controller/admincontroller");

//session middleware
router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));


//code for multer
const multer=require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).array("img",4);




//nocache
const nocache=require("nocache");
router.use(nocache());


//admin login route
router.get("/",admins.loginget);
router.post("/adminprofile",admins.loginpost);

router.get("/adminprofile",admins.adminprofget);

//dashboard route
router.get("/dashboard",admins.dashget);


router.get("/excelreport",admins.excelget);
router.get("/pdfreport",admins.pdfget);

//user management routes
router.get("/usermanage",admins.usermanget);
router.get("/blockuser/:id",admins.blockuserget);


//offer management routes
router.get("/offermanage",admins.offermanget);

router.get("/offerAdd",admins.addofferget)
router.post("/addOffer",admins.addofferpost)
router.get("/deleteOffer/:id",admins.deleteOffer);


//router for logout
router.get("/logoutadmin",admins.logoutadminget);






module.exports=router;