const express=require("express");
const router=express.Router();
const app=new express();

//for product image uploading
const path=require("path");
const multer=require("multer");



//mongodb models importing
const collection=require("../model/user");
const categorym = require("../model/category");




const productm=require("../model/products");
const userm=require("../model/user");
const profilem=require("../model/profilem");
const cartm=require("../model/cartm");
const profilepicm=require("../model/profilepicm");
const addressm=require("../model/addressm");

const orderm=require("../model/orderm");

const offerm=require("../model/offerm");



const ExcelJS = require('exceljs');
const PDFDocument = require("pdfkit-table");


//nocache
const nocache = require("nocache");
const { log } = require("console");
app.use(nocache());



const controls={

    //admin login routes

    loginget:(req,res)=>{
        if(req.session.admindata){
            res.redirect('/admin/adminprofile')
        }
        else{
            res.render("adminlogin");
        }
        
    },
   
    loginpost:(req,res)=>{
        const credentials={
            email:"admin@gmail.com",
            password:1234098
        }
        console.log(req.body);
        if(credentials.email==req.body.email&&credentials.password==req.body.password){
            req.session.admindata=credentials
            console.log("Entered into the Adminprofile");
            res.redirect("/admin/adminprofile");
        }else{
            console.log(req.body.email);
            res.render("adminlogin",{msg:"invalid credentials"})
        }
     },
     
     
    adminprofget:(req,res)=>{
        if(req.session.admindata){
            res.render("adminprofile")
        }else{
            res.redirect("/admin")
        }
    }, 



    // dashboard routes

    dashget: async (req, res) => {
      try {
        // Daily Orders
        const dailyOrders = await orderm.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
    
        const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
          (result, order) => {
            result.dates.push(order._id);
            result.orderCounts.push(order.orderCount);
            result.totalOrderCount += order.orderCount;
            return result;
          },
          { dates: [], orderCounts: [], totalOrderCount: 0 }
        );
    
        // Weekly Orders
        const weeklyOrders = await orderm.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$orderdate" },
                week: { $week: "$orderdate" },
              },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.week": 1 } },
        ]);

        // Extract only the order counts for weekly orders
        const orderCountWeekly = weeklyOrders.map(order => order.orderCount);
        console.log("Weekly Order Counts: ", orderCountWeekly);

        // Now the 'orderCountWeekly' array contains only the order counts for each week
        const weeklyData = weeklyOrders.reduce((result, order) => {
          const weekYearString = `${order._id.year}-Week${order._id.week}`;
          result.push({
            week: weekYearString,
            orderCount: order.orderCount,
          });
          return result;
        }, []);
        console.log("Weekly Data: ", weeklyData);

       let weekdata=orderCountWeekly;
              
        // Yearly Orders
        const yearlyOrders = await orderm.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
    
        const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
          (result, order) => {
            result.years.push(order._id);
            result.orderCounts3.push(order.orderCount);
            result.totalOrderCount3 += order.orderCount;
            return result;
          },
          { years: [], orderCounts3: [], totalOrderCount3: 0 }
        );
        
    
        res.render("dashboard", { dates, orderCounts, totalOrderCount, weekdata, years, orderCounts3, totalOrderCount3 });
    
      } catch (error) {
        console.error('Error fetching and aggregating orders:', error);
        res.status(500).send('Internal Server Error');
      }
    },



    excelget:async(req, res) => {
      try {
        console.log("Excel");
    
        const startdate = new Date(req.query.startingdate);
        const Endingdate = new Date(req.query.endingdate);
        console.log(startdate);
        console.log(Endingdate);
        Endingdate.setDate(Endingdate.getDate() + 1);
    
        const orderCursor = await orderm.aggregate([
          {
            $match: {
              orderdate: { $gte: startdate, $lte: Endingdate },
            },
          },
        ]);
        console.log(orderCursor);
        if (orderCursor.length === 0) {
          return res.redirect("/admin/dashboard");
        }
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");
    
        // Add data to the worksheet
        worksheet.columns = [
          { header: "Username", key: "username", width: 15 },
          { header: "Product Name", key: "productname", width: 20 },
          { header: "Quantity", key: "quantity", width: 15 },
          { header: "Price", key: "price", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Order Date", key: "orderdate", width: 18 },
          { header: "Address ID", key: "address", width: 30 },
          { header: "Payment Method", key: "paymentmode", width: 15 },
        ];
    
        for (const orderItem of orderCursor) {
          // Fetch address details based on the address ID
    
          // worksheet.addRow({
          //   username: orderItem.username,
          //   productname: orderItem.productname,
          //   quantity: orderItem.quantity,
          //   price: orderItem.price,
          //   status: orderItem.status,
          //   orderdate: orderItem.orderdate,
          //   address: orderItem.address,
          //   paymentmode:orderItem.paymentmode,
          // });
          
          worksheet.addRow({
            username: orderItem.username,
            productname: orderItem.productcollection
              .map((product) => product.productname)
              .join(", "),
            quantity: orderItem.productcollection.map((product) => product.quantity).join(", "),
            price: orderItem.productcollection.map((product) => product.price).join(", "),
            status: orderItem.productcollection.map((product) => product.status).join(", "),
            orderdate: orderItem.orderdate,
            address: orderItem.address,
            paymentmode:orderItem.paymentmode,
            
          });
        }
    
        // Generate the Excel file and send it as a response
        workbook.xlsx.writeBuffer().then((buffer) => {
          const excelBuffer = Buffer.from(buffer);
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
          res.send(excelBuffer);
        });
      } catch (error) {
        console.error("Error creating or sending Excel file:", error);
        res.status(500).send("Internal Server Error");
      }
    },


    pdfget: async (req, res) => {
      try {
        const startingDate = new Date(req.query.startingdate);
        const endingDate = new Date(req.query.endingdate);
    
        // Fetch orders within the specified date range
        const orders = await orderm.find({
          orderdate: { $gte: startingDate, $lte: endingDate },
        });
    
        // Create a PDF document
        const doc = new PDFDocument();
        const filename = "sales_report.pdf";
    
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/pdf");
    
        doc.pipe(res);
    
        // Add content to the PDF document
        doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
    
        // Define the table data
          const tableData = {
            headers: [
                "Username",
                "Product Name",
                "Price",
                "Quantity",
                "Order Status",
                "Payment Method"
               
            ],
            // rows: orders.map((order) => [
            //     order.username,
            //     order.productname,
            //     order.price,
            //     order.quantity,
            //     order.address,
            //     order.paymentmode,
              
            // ]),
            rows: orders.map((order) => [
              order.username,
              order.productcollection.map((product) => product.productname).join(", "),
              order.productcollection.map((product) => product.price).join(", "),
              order.productcollection.map((product) => product.quantity).join(", "),
              order.productcollection.map((product) => product.status).join(", "),
              order.paymentmode,
            ]),
        };
        
        // Draw the table
        await doc.table(tableData, {
            prepareHeader: () => doc.font("Helvetica-Bold"),
            prepareRow: () => doc.font("Helvetica"),
        });
    
        // Finalize the PDF document
        doc.end();
      } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Internal Server Error");
      }
    },
    
    
    //user management routes

    usermanget: async (req, res) => {
      if (req.session.admindata) {
        try {
          // Set default values for page and page size
          const page = parseInt(req.query.page) || 1;
          const pageSize = parseInt(req.query.pageSize) || 10;
    
          // Calculate skip value to skip records based on pagination
          const skip = (page - 1) * pageSize;
    
          // Fetch total count of users for pagination
          const totalUsers = await collection.countDocuments();
    
          // Fetch paginated user list from the database
          const datasdb = await collection
            .find()
            .skip(skip)
            .limit(pageSize);
    
          // Calculate total pages based on total users and page size
          const totalPages = Math.ceil(totalUsers / pageSize);
    
          // Render the page with the data and pagination information
          res.render("usermanage", { datasdb, currentPage: page, totalPages, pageSize });
        } catch (error) {
          console.log(error);
          res.status(500).send("Internal Server Error");
        }
      }else{
        res.redirect("/admin");
      }
    },
        

    //user blocking 

    blockuserget:async (req,res)=>{
            if(req.session.admindata){
                console.log("blockuser route Called")
            //here extracti`ng user id from URL parameters
            const id=req.params.id;
            //attempting to find the user document from collection db storing it into the docval;
            const docval=await collection.findOne({_id:id});
            //checking the availibily of the user document;
            if(docval){
                docval.isBlocked=!docval.isBlocked
                //saving the updated user back to the document collection
                await docval.save();
                //after blocking/unblocking the user redirected to the usermanage page;
                res.redirect("/admin/usermanage");
            }else{
                res.status(400).send("User not found");
            }
        }else{
          res.redirect("/admin");
        } 
    },


    offermanget:async(req,res)=>{
      if(req.session.admindata){
      try{
        const offers=await offerm.find();
        const products=await productm.find()
        const categories=await categorym.find()
        
        res.render("offermanage",{offers,categories,products});
      }catch(error){
        console.log(error);
        return res.status(500).send("Failed to fetch offers")
      }
      }else{
        res.redirect("/admin");
      }
    },


    addofferget:async(req,res)=>{
      try{
        const products=await productm.find()
        const categories=await categorym.find()
        res.render("partials/addOfferForm",{categories,products})
      }catch(error){
        console.log(error);
        return res.status(500).send("Failed to get the form")
      }
    },



    addofferpost:async(req,res)=>{
      try{
        
        const {product,category,discount,expiryDate}=req.body;
        // const productName = await productm.findById(product)
        // const categoryName = await categorym.findById(category)
        const isthere=await offerm.findOne({$or:[{applicableProduct:product},{applicableCategory:category}]});
        if(isthere===null){
          try{
            const newOffer=new offerm({
              applicableProduct:product,
              applicableCategory:category,
              discount:discount,
              expiryDate:expiryDate,
              isActive:true,
            });
            
          newOffer.save();
          }catch(error){
            console.log(error);
            return res.status(500).send("Error Insering offer");
          }
          res.redirect("/admin/offermanage")
        }else{
          const products=await productm.find()
          const categories=await categorym.find()
          res.render("partials/addOfferForm",{message:"Offer Already exist!",products,categories});
        }
        }catch(error){
          console.log(error);
          res.status(500).send("Error Inserting Offer");
        }
    },

    deleteOffer:async(req,res)=>{
      try {
        const offerId = req.params.id;
        const offer = await offerm.findById(offerId);
    
        if (!offer) {
          return res.status(404).send('Offer not found');
        }
        await offerm.findByIdAndDelete(offerId);
  
        res.redirect('/admin/offermanage'); 
      } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).send('Internal Server Error');
      }
    },
    
    
    //product management routes

    logoutadminget:(req,res)=>{
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin');
            }
        });
    }


}    


module.exports=controls;