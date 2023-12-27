const express=require("express");
const router=express.Router();
const app=new express();

//for product image uploading
const path=require("path");
const multer=require("multer");



//mongodb models importing
const collection=require("../model/user");
const category = require("../model/category");
const product=require("../model/products")



const products=require("../model/products");
const userm=require("../model/user");
const profilem=require("../model/profilem");
const cartm=require("../model/cartm");
const profilepicm=require("../model/profilepicm");
const orderm=require("../model/orderm");
const addressm=require("../model/addressm");


//nocache
const nocache = require("nocache");
const { log } = require("console");
app.use(nocache());



const controls={

    //to get category manage page
    categoryget: async (req, res) => {
        if (req.session.admindata) {
          try {
            
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
      
            
            const skip = (page - 1) * pageSize;
      
            
            const totalCategories = await category.countDocuments();
      
            
            const catdb = await category
              .find()
              .skip(skip)
              .limit(pageSize);
      
            
            const totalPages = Math.ceil(totalCategories / pageSize);
      
            
            res.render("categorymanage", { datasdb: catdb, currentPage: page, totalPages, pageSize });
          } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
          }
        } else {
          res.redirect("/admin");
        }
      },

    //to get addcategory page
    addcatget:(req,res)=>{
        if(req.session.admindata){
            res.render("addCategory");
        }else{
            res.redirect("/admin")
        }
        
    },
    //to post from addcategory page
    addcatpost:async(req,res)=>{
        try {
            const categoryName = req.body.categoryname;
            const isPresent = await category.findOne({ category:categoryName });
            if (isPresent) {
                const catdb = await category.find();
                res.render("categorymanage",{datasdb:catdb,msg:"Category Already Exists"});
            } else {
                const categor = { category: categoryName };
                const value = await category.insertMany([categor]);
                if (!value) {
                    res.render("categorymanage",{datasdb:catdb,msg:"Category Not Inserted"});
                } else {
                    const catdb = await category.find();
                    res.render("categorymanage",{datasdb:catdb,msg:"Category Successfully Inserted"});
                }
            }
        } catch (error) {
            console.log(error);
            res.render("categorymanage",{msg:"An error occurred while processing the request"});
        }
    },
     
    //category editing routes

    editcatget:async(req,res)=>{
        if(req.session.admindata){
            const id=req.params.id
        const catdb=await category.findById({_id:id})
        console.log(catdb);
        if(req.xhr){
        // res.render("editCategory",{datasdb:catdb});
        return res.json({ datasdb: catdb });
        }else{
            res.render("editCategory",{datasdb:catdb});
        }  
      }else{
        res.redirect("/admin");
      }     
    },

    editcatpost:async(req,res)=>{
        try {
            const id = req.params.id;
            const existingCategory = await category.findOne({
                category: req.body.categoryname
            });
            if (existingCategory && existingCategory._id != id) {
                console.log("Category name already exists. Please choose a different name.");
                return res.redirect("/categorymanage");
            }
            await category.findByIdAndUpdate(id, {
                category: req.body.categoryname
            })
            .then((catdb) => {
                console.log("Updated: " + catdb);
                res.redirect("/categorymanage");
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    deletecatget:async(req,res)=>{
        if(req.session.admindata){
            try{
                const id=req.params.id;
                console.log(id);
                const result=await category.findByIdAndDelete(id,{id});
                if(result){
                    const catdb=await category.find();
                    res.render("categorymanage",{datasdb:catdb});
                }else{
                    res.json({msg:"Category neighther found nor deleted"})
                }
            }
            catch(error){
                res.json({msg:error.message});
            }
        }
       
    },
}


module.exports=controls;