const express=require("express");
const router=express.Router();
const app=new express();

//for product image uploading
const path=require("path");
const multer=require("multer");
const fs=require("fs");



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
    productget: async (req, res) => {
        if (req.session.admindata) {
          try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const skip = (page - 1) * pageSize;
      
            const totalProducts = await product.countDocuments();
      
            const prdlist = await product
              .find()
              .populate('category')
              .skip(skip)
              .limit(pageSize);
      
            const totalPages = Math.ceil(totalProducts / pageSize);
      
            res.render("productmanage", { prdlist, currentPage: page, totalPages, pageSize });
          } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
          }
        } else {
          res.redirect("/admin");
        }
      },
      

     // product adding routes

    addprodget:async(req,res)=>{
        if(req.session.admindata){
            try{
               
                const categorylist=await category.find()
               
                res.render("addproduct",{Category:categorylist});
            }
            catch(error){
                console.log(error);
            }
        }
       
    },
    addprodpost:async(req,res)=>{
        //here extracting the data from request body and file
        const productdata={
            productname:req.body.productname,
            category: req.body.category,
            price:req.body.price,
            rating:req.body.rating,
            model:req.body.model,
            description:req.body.description,
            stock:req.body.stock,
            // img:req.files.map(file=>file.path.substring(6)),
            img:req.body.croppedImages || [],
          }

           

          console.log(productdata);

          try{
            
            const result=await product.insertMany([productdata]);
            console.log("Inserted",result);
            
            res.redirect("/productmanage")
          }
          catch(error){
            console.log(error);
            res.status(500).send("Internal Sever Error");
          }
    },

    //product Editing Routes

    editprodget:async(req,res)=>{
        if(req.session.admindata){
            try{
                const id=req.params.id;
                const editedProduct=await product.findById(id);
                const categorylist=await category.find();
                console.log('category is ',categorylist);
                res.render("editproduct",{editedProduct,Category:categorylist})
            }
            catch(error){
                console.log(error);
                res.status(500).send("Internal Sever Error");
            }
        }
        
    },

    editprodpost:async(req,res)=>{
        try{
            const id=req.params.id;
            const editedProduct=await product.findByIdAndUpdate(id,{
                productname:req.body.productname,
                category: req.body.category,
                model:req.body.model,
                price:req.body.price,
                rating:req.body.rating,
                description:req.body.description,
                stock:req.body.stock,
                // img:req.files.map(file=>file.path.substring(6)),
            });
            if(!editedProduct){
              res.render("editproduct", { editedProduct: editedProduct });
            }else{
                if(req.files && req.files.length>0){
                    const newImages=req.files.map(file=>file.path.substring(6));
                    editedProduct.img=editedProduct.img.concat(newImages);
                }
                if(!editedProduct){
                    console.log("Product Not Found");
                    res.status(404).send("Product not Found");
                    return;
                }
                await editedProduct.save();
                res.redirect("/productmanage")
            }
        }
        catch(error){
            console.log(error);
            res.send("An error occured while updating the product");
        }
    },

    removeimgprd:async(req,res)=>{
        const productId=req.body.productId;
        const imageIndex=req.body.imageIndex;
        console.log(productId);
        try{
            const productOne=await product.findById(productId);
            if(!productOne){
                return res.status(404).send("Product not found");
            }
            if(imageIndex<0 || imageIndex>=productOne.img.length){
                return res.status(400).send("Invalid image index");
            }
            productOne.img.splice(imageIndex,1);
            await productOne.save();
            res.status(200).send("Image removed Successfully");
        }
        catch(error){
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    deleteprodget:async(req,res)=>{
        if(req.session.admindata){
            try{
                const id=req.params.id;
                const result=await product.findByIdAndDelete({_id:id});
                if(result){
                    console.log('deleted');
                    const prdlist=await product.find();
                    // res.json({ msg: "Product successfully deleted", prdlist });
                    res.redirect('/productmanage')
                }else{
                    res.json({msg:"Product Not found"})
                }
               }catch(error){
                console.log(error);
                res.json({msg:error.message});
            }
        }
      
    },

}

module.exports=controls;