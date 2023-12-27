const express=require("express");
const router=express.Router();
const path=require("path");
const session=require('express-session')

const catagories=require("../controller/categorycontroller");

//session middleware
router.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));



//nocache
const nocache=require("nocache");
router.use(nocache());


//catagory management routes
router.get("/",catagories.categoryget);

router.get("/addcategory",catagories.addcatget);//add category routes
router.post("/addcategory",catagories.addcatpost);

router.get("/editcategory/:id",catagories.editcatget);//edit category routes
router.post("/editcategory/:id",catagories.editcatpost);

router.get("/categorymanage/:id",catagories.deletecatget);//delete category route


module.exports=router;