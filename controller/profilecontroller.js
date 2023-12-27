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
const offerm=require("../model/offerm");


const PDFDocument = require("pdfkit");
const path = require('path');
const imagePath = path.join(__dirname, 'images', 'logo.png');


const nocache=require("nocache");
app.use(nocache());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

  function isPasswordValid(password) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}



    // nodemailer stuffs for otp

    const nodemailer=require("nodemailer");
const address = require("../model/addressm");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: "fifapstation@gmail.com",
        pass: "qdssgtorkqolnwcc",
        },
    });

    //OTP Generting 
    let otp;
    let userdetails;
    function generateOtp() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }  

  

  


const controls={
    profileget:async(req,res)=>{
        if(req.session.userid){
            try{
                const user=req.session.userid;

                const userdetails=await userm.findOne({_id:user});
              
                const profileimg=await profilepicm.find({userid:user});
                
                res.render("profilepage",{userdetails,profileimg});
            }
            catch(error){
                console.log(error)
            }
        }else{
            res.redirect("/login");
        }
    },

    addressget:async(req,res)=>{
        if(req.session.userid){
           try{
            const user=req.session.userid;
            const useraddress=await addressm.find({userid:user});
            res.render("showaddress",{useraddress});
           }
           catch(error){
            console.log(error);
           }
        }else{
            res.redirect("/login");
        }
        
    },

    Addaddressget:async(req,res)=>{
       res.render("addAddress");
    },

    Addaddresspost:async(req,res)=>{
        const {firstname,lastname,address,city,state,pincode,phone}=req.body;
        try{
            const user = req.session.userid;
            console.log(firstname)

        const newAddress={
            userid:req.session.userid,
            firstname:firstname,
            lastname:lastname,
            address:address,
            city:city,
            state:state,
            pincode:pincode,
            phone:phone,
        }

        await addressm.insertMany([newAddress])
        .then(x=>{
            console.log('inserted ',x);
            res.redirect("/profile/address")    
        })
        

        }catch(error){
            console.log(error);
            res.status(500).json({message:"Internal Server"})
        }
    },

    deladdressget:async(req,res)=>{
        console.log("ready to delete")
        const addressId=req.params.id;
        try{
            await addressm.findByIdAndDelete(addressId);
        }
        catch(error){
            console.log(error)
            res.status(500).json("Internal Server Error");
        }
        res.redirect("/profile/address")
    },

    editaddressget:async(req,res)=>{
        try{
            const addressData=await addressm.findOne({_id:req.params.id});
            res.render("editAddress",{addressData});
        }
        catch(error){
            console.log(error)
            res.status(500).json("message:Internal Server Error")
        }
    },

    editaddresspost:async(req,res)=>{
        try{
            const addressId=req.params.id

            //find the address in the database by id
            const existingAddress=await addressm.findOne({_id:addressId});

            // updation
            existingAddress.firstname = req.body.firstname;
            existingAddress.lastname = req.body.lastname;
            existingAddress.address = req.body.address;
            existingAddress.city = req.body.city;
            existingAddress.state = req.body.state;
            existingAddress.pincode = req.body.pincode;
            existingAddress.phone = req.body.phone;

            // saving the edited address to the database 
            await existingAddress.save();
            res.redirect("/profile/address");


        }catch(error){
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },

    edituserget: async (req, res) => {
        if(req.session.userid){
            try{
                const user=req.session.userid;
                const userdetails=await userm.findOne({_id:user});
                res.render("edituserpage",{userdetails})
            }catch(error){
                console.log(error);
                res.status(500).json("message:Internal Server Error");
            }
        }else{
            res.redirect("/login");
        }
    },


    edituserpost: async (req, res) => {
        try {
            const userId = req.params.id;
            const existinguserdetails = await userm.findOne({ _id: userId });
    
            // Update user details
            existinguserdetails.Username = req.body.username;
            existinguserdetails.email = req.body.email;
    
            
            await existinguserdetails.save();
    
            // Generate and send OTP
             otp = generateOtp();

            console.log("The OTP is " + otp);
            const mailstuffs={
                from:"fifapstation@gmail.com",
                to: existinguserdetails.email,
                subject:"OTP verification",
                text:`Your OTP is ${otp} please dont share with others`,
            };
            transporter.sendMail(mailstuffs,(error,info)=>{
                if(error){
                    console.log(error+"OTP ERROR");
                    res.render("edituserpage",{msg:"failed to send OTP"});
                }else{
                    console.log("OTP Successfully send"+info.response);
                    console.log(req.session.userdb);
                    res.render("otppage",{msg:"OTP send successfully Please check your email"})
                }
            });
            setTimeout(() => {
                otp = null;
                console.log('deleted', otp);
            }, 20000);
            res.render("profileotp", { userId: userId ,msg:"Otp send successfully"});
        } catch (error) {
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },

    resendotppost:async(req,res)=>{

        otp = generateOtp();

        console.log("The OTP is " + otp);
        const mailstuffs={
            from:"fifapstation@gmail.com",
            to: existinguserdetails.email,
            subject:"OTP verification",
            text:`Your OTP is ${otp} please dont share with others`,
        };
        transporter.sendMail(mailstuffs,(error,info)=>{
            if(error){
                console.log(error+"OTP ERROR");
                res.render("edituserpage",{msg:"failed to send OTP"});
            }else{
                console.log("OTP Successfully send"+info.response);
                console.log(req.session.userdb);
                res.render("otppage",{msg:"OTP send successfully Please check your email"})
            }
        });
        setTimeout(() => {
            otp = null;
            console.log('deleted', otp);
        }, 20000);
        res.render("profileotp", { userId: userId ,msg:"Otp send successfully"});
    },

    otpget:async(req,res)=>{
        setTimeout(() => {
            otp = null;
            console.log('deleted', otp);
        }, 20000);
        res.render("profileotp", { userId: req.params.id });
    },

    otppost:async(req,res)=>{
        try {
            const userId = req.params.id;
            const enteredOTP = req.body.otpbox;
    
            const user = req.session.userid;
            const userdetails = await userm.findOne({ _id: user });
    
            // Check if enteredOTP is correct
            if (enteredOTP === otp) {
                await userm.findByIdAndUpdate(userId, {
                    email: req.body.email,
                });

                res.render("profilepage", { userdetails });
            } else {
                res.render("profileotp", { msg: "Incorrect or expired OTP", userId });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Failed to update user details" });
        }
    },

   

    changepassget:async(req,res)=>{
        try{
            const user=req.session.userid;
            res.render("changepasspage",{message:""});
        }catch(error){
            console.log(error);
            res.status(500).json("Message:Internal Server Error");
        }
    },

    changepasspost:async(req,res)=>{
        if (req.session.userid) {
            try {
                const userID = req.session.userid;
                const userData = await userm.findOne({ _id: userID });
    
                if (userData.password === req.body.currentPassword) {
                    const newPassword = req.body.newPassword;
                    const confirmPassword = req.body.confirmPassword;

                    if (!isPasswordValid(newPassword)) {
                        return res.render("changepasspage", {
                            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit."
                        });
                    }
    
                    if (newPassword === confirmPassword) {
                        await userm.findByIdAndUpdate(
                            { _id: userID },
                            {
                                password: newPassword
                            }
                        );
    
                        console.log("Changed Password is" + userData.password);
                        res.redirect("/profile");
                    } else {
                        res.render("changepasspage", { message: "Password not cofirmed . Try again!" });
                    }
                } else {
                    res.render("changepasspage", { message: "Current Password is not matching. Try Again!!!" });
                }
            } catch (error) {
                console.log(error);
                res.status(500).json("message: Internal Server Error");
            }
        } else {
            // Handle the case when the user is not logged in
            res.redirect("/login"); // Redirect to the login page or handle it as per your application flow
        }
    },


    ordersget: async (req, res) => {
    if (req.session.userid) {
            try {
            // Set default values for page and page size
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;

            // Calculate skip value to skip records based on pagination
            const skip = (page - 1) * pageSize;

            // Fetch total count of orders for pagination
            const totalOrders = await orderm.countDocuments({ userid: req.session.userid });

            // Fetch paginated order list from the database
            const orders = await orderm
                .find({ userid: req.session.userid })
                .skip(skip)
                .limit(pageSize);

            // Calculate total pages based on total orders and page size
            const totalPages = Math.ceil(totalOrders / pageSize);

            // Render the page with the data and pagination information
            res.render("userorders", { orders, currentPage: page, totalPages, pageSize });
            } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
            }
        } else {
            res.redirect("/login");
        }
    },

    orderscanget: async (req, res) => {
        try {
          console.log("entered into the order cancellation");
          const orderId = req.params.id;
          const productId = req.params.productid;
          console.log(orderId);
          const userId = req.session.userid;
          const newStatus = "Cancelled";
          console.log(userId);
      
          // Find the order with the specified conditions
          const order = await orderm.findOne({
            _id: orderId,
            'productcollection.productid': productId
          });
      
          if (!order) {
            return res.status(404).json({ error: "Order not found" });
          }
      
        
          if (order.paymentmode === 'wallet-payment') {
            // Calculate the refund amount based on the canceled product
            const canceledProduct = order.productcollection.find(product => product.productid.toString() === productId);
            const refundAmount = canceledProduct.price * canceledProduct.quantity;
      
            // Update user's wallet by adding the refund amount
            const user = await userm.findOneAndUpdate(
              { _id: userId },
              { $inc: { wallet: refundAmount } },
              { new: true }
            );
      
            // Update the stock of the canceled product
            const product = await productm.findOneAndUpdate(
              { _id: canceledProduct.productid },
              { $inc: { stock: canceledProduct.quantity } },
              { new: true }
            );
      
            // Update the order status to "Cancelled"
            const updatedOrder = await orderm.updateOne(
              { _id: orderId, 'productcollection.productid': productId },
              { $set: { 'productcollection.$.status': newStatus } }
            );
      
            console.log("updated", updatedOrder);
      
            return res.status(200).json({
              success: "Order cancelled",
              walletBalance: user.wallet,
              updatedStock: product.stock
            });
          }
      
          // If payment mode is not "wallet-payment," simply update the order status to "Cancelled"
          const updatedOrder = await orderm.updateOne(
            { _id: orderId, 'productcollection.productid': productId },
            { $set: { 'productcollection.$.status': newStatus } }
          );
      
          // Find the canceled product to get the quantity
          const canceledProduct = order.productcollection.find(product => product.productid.toString() === productId);
      
          // Update the stock of the canceled product
            await productm.findOneAndUpdate(
            { _id: canceledProduct.productid },
            { $inc: { stock: canceledProduct.quantity } }
           );

           console.log("updated", updatedOrder);

           return res.status(200).json({
            success: "Order cancelled",
            walletBalance: null,
            updatedStock: null,
          });

        } catch (error) {
          console.error("Error during order cancellation:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      },
      


    getOrderSum:async(req,res)=>{
    try {
        const userid = req.session.userid;
        const orderid = req.params.id;
        const productid = req.params.productid;
        const order = await orderm.findById(orderid)
        const orderAddress = await addressm.findById(order.address)

        const userCart=await cartm.find({userid:req.session.userid});

        const offersForProducts = [];

        

        for(const cartItem of userCart){
            const product =await productm.findById(cartItem.productid);
            const categorydata= await category.findById(product.category);

            const offer=await offerm.findOne({$or:[{applicableProduct:product.productname},{applicableCategory:categorydata.category}]});

            offersForProducts.push({
                cartItem: cartItem,
                offer: offer ? offer : null,
            });
        }


        res.render("invoicepage", { offers:offersForProducts,order, productid, orderAddress});
        } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to fetch orders. Please try again.");
        }
    },

    getInvoice:async(req,res)=>{
        try {
            const userid = req.session.userid;
            console.log(userid)
            const orderid = req.params.id;
            const productid = req.params.productid;
            const userDetails = await userm.findById(userid);
            const order = await orderm.findById(orderid);
            const orderAddress = await addressm.findById(order.address)
           
            let productdata;
        
            for (let product of order.productcollection) {
                if (productid == product.productid) {
                    productdata = product;
                    break;
                }
            }
        
            const doc = new PDFDocument();
        
            // Set response headers to trigger a download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        
            // Pipe the PDF document to the response
            doc.pipe(res);
        
            const imagePath = "assets/images/logo.png";
            const imageWidth = 100;
            const imageX = 550 - imageWidth;
            const imageY = 50;
        
            doc.image(imagePath, imageX, imageY, { width: imageWidth });
            doc.moveDown(1);
        
            // Add content to the PDF document
            doc.fontSize(16).text("Billing Details", { align: "center" });
            doc.moveDown(1);
            doc.fontSize(10).text("Order Details", { align: "center" });
            doc.text(`Order ID: ${orderid}`);
            doc.moveDown(0.3);
            doc.text(`Name: ${order.username || ""}`);
            doc.moveDown(0.3);
            doc.text(`Email: ${userDetails.email || ""}`);
            doc.moveDown(0.3);
        
            doc.moveDown(0.3);
            doc.text(`Address: ${orderAddress.address || ""}`);
            doc.moveDown(0.3);
            doc.text(`Payment Method: ${order.paymentmode|| ""}`);
        
            console.log("hghgd");
        
            doc.moveDown(0.3);
        
            const headerY = 300; // Adjust this value based on your layout
            doc.font("Helvetica-Bold");
            doc.text("Name", 100, headerY, { width: 150, lineGap: 6 });
            doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
            doc.text("Quantity", 400, headerY, { width: 150, lineGap: 5 });
            doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
            doc.font("Helvetica");
        
            // Table rows
            const contentStartY = headerY + 30; // Adjust this value based on your layout
            let currentY = contentStartY;
        
            doc.text(productdata.productname || "", 100, currentY, {
                width: 150,
                lineGap: 5,
            });
        
            doc.text(productdata.status || "", 300, currentY, {
                width: 50,
                lineGap: 5,
            });
        
            doc.text(productdata.quantity || "", 400, currentY, {
                width: 50,
                lineGap: 5,
            });
        
            doc.text(productdata.price || "", 500, currentY, {
                width: 50,
                lineGap: 5,
            });
        
            // Calculate the height of the current row and add some padding
            const lineHeight = Math.max(
                doc.heightOfString(productdata.productname || "", { width: 150 }),
                doc.heightOfString(productdata.status || "", { width: 150 }),
                doc.heightOfString(productdata.price || "", { width: 50 })
            );
        
            currentY += lineHeight + 10; // Adjust this value based on your layout
        
            doc.text(`Total Price: ${productdata.price * productdata.quantity || ""}`, {
                width: 400, // Adjust the width based on your layout
                lineGap: 5,
            });
        
            // Set the y-coordinate for the "Thank you" section
            const separation = 50; // Adjust this value based on your layout
            const thankYouStartY = currentY + separation; // Update this line
        
            // Move to the next section
            doc.y = thankYouStartY; // Change this line
        
            // Move the text content in the x-axis
            const textX = 60; // Adjust this value based on your layout
            const textWidth = 500; // Adjust this value based on your layout
        
            doc
                .fontSize(16)
                .text(
                    "Thank you for choosing My-Cart! We appreciate your support and are excited to have you as part of our family.",
                    textX,
                    doc.y,
                    { align: "left", width: textWidth, lineGap: 10 }
                );
        
            doc.end();
        
        } catch (err) {
            console.error(err);
            return res.status(500).send("Failed to fetch orders. Please try again.");
        }
    },


    walletget:async(req,res)=>{
        res.render("walletpage");
    }
        
}

module.exports=controls;