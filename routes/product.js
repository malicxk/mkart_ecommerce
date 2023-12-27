const express=require("express");
const router=express.Router();
const path=require("path");
const session=require('express-session')

const products=require("../controller/productcontroller");

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


//product management routes
router.get("/",products.productget);

router.get("/addproduct",products.addprodget);// add product routes
router.post("/addedproduct",upload,products.addprodpost);



router.get("/editproduct/:id",products.editprodget);//edit product routes
router.post("/editproduct/:id",upload,products.editprodpost);
//to remove the product image 
router.post("/removeimageprd",products.removeimgprd);



router.get("/deleteproduct/:id",products.deleteprodget);// delete product route






module.exports=router;