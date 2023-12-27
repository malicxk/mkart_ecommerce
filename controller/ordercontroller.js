const express=require("express");
const app=new express();
const session=require("express-session");


const productm=require("../model/products");
const category=require("../model/category");
const userm=require("../model/user");
const profilem=require("../model/profilem");
const cartm=require("../model/cartm");
const profilepicm=require("../model/profilepicm");
const orderm=require("../model/orderm");
const addressm=require("../model/addressm");


const nocache=require("nocache");
const router = require("../routes/profile");
app.use(nocache());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));


const controls={
  
    ordermanget: async (req, res) => {
        try {
          const page = parseInt(req.query.page) || 1;
          const pageSize = parseInt(req.query.pageSize) || 10; // Set the desired page size
      
          const totalOrders = await orderm.countDocuments();
          const totalPages = Math.ceil(totalOrders / pageSize);
      
          const orders = await orderm
            .find()
            .sort({ orderdate: -1 }) // Sort orders by date in descending order
            .skip((page - 1) * pageSize)
            .limit(pageSize);
      
          res.render("ordermanage", { orders, totalPages, currentPage: page, pageSize });
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },

    ordermanpost:async(req,res)=>{
        try{
            const orderId=req.params.id;
            const productId=req.params.productid
            const newStatus=req.body.newStatus
            

            await orderm.updateOne(
                {_id:orderId,'productcollection.productid':productId},
                {$set:{"productcollection.$.status":newStatus}})
                
                res.redirect("/order");
        }catch(err){
            console.log(err);
        }
    },


    orderdelpost:async(req,res)=>{
        const orderId = req.params.id;
        try {
            const orders = await orderm.findByIdAndDelete(orderId);
            if (!orders) {
                return res.status(404).send('Order not found');
            }
            res.redirect("/order"); 
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },



}


module.exports=controls;