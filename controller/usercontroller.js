const express=require("express");
const app=new express();

const collection=require("../model/user");
const products=require("../model/products");
const offerm=require("../model/offerm");

//nocache
const nocache=require("nocache");
app.use(nocache());


require('dotenv').config();

// nodemailer stuffs for otp

const nodemailer=require("nodemailer");
const categorym = require("../model/category");
const { isErrored } = require("nodemailer/lib/xoauth2");
const { y } = require("pdfkit");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

//OTP Generting 

let userdetails;
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }  


function calculateExpirationTime() {
const now = new Date();
const expirationTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in milliseconds
return expirationTime;
}

function generateReferralCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }
  
    return referralCode;
  }


  function generateReferralLink(baseUrl) {
    return `${baseUrl}/ref/${generateReferralCode(8)}`;
}




let wallet;

let referral;
let referredUser ;
let referred="false"

let reflink;
let refuser;
let refferedlink="false"

    
   
  
  
// function isOtpValid(expirationTime) {
//     // Implement your logic to check if the OTP is still valid based on the expiration time
//     const currentTime = Date.now();
//     return currentTime < new Date(expirationTime).getTime();
// }



//Email validating function

// function isEmailValid(email) {
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailPattern.test(email);
//   }

// //password validation function

// function isPasswordValid(password) {
//     const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
//     return passwordRegex.test(password);
// }
  
let otp
const controls={

    //home page routes
    homeroute:(req,res)=>{
        res.render("userHome1");
    },

    //login page routes
    loginget:(req,res)=>{
        user=req.session.userdet
        if(user){
            res.redirect("/userHome");
        }else{
            res.render("login");
        };
    },

    loginpost:async(req,res)=>{
        try{
            const maildb=await collection.findOne({email:req.body.email});
        if(!maildb){
            res.render("login",{msg:"User does not exist"});
        }else if(maildb.isBlocked){
            res.render("login",{msg:"User is blocked"});
        }else if(req.body.email===maildb.email&&req.body.password===maildb.password){
            req.session.userdet=maildb;
            req.session.userid=maildb._id
            console.log("id is",maildb._id);
            res.redirect('/userHome')
        }else{
            res.render("login",{msg:"invalid email or password"});
        }

        }
        catch(error){
            console.log(error);
            res.send("oops!!!..something went wrong......")
        };
    },
        
        //sign up routes

     
    registerget:(req,res)=>{
        res.render("register");
    },

        
    
    registerpost: async (req, res) => {
        try {
            console.log("Start of try block");


            if (req.body.referralCode) {
                referral = req.body.referralCode;
                referredUser = await collection.findOne({ referalcode: referral });
                console.log('referel user is', referredUser);
                if (referredUser) {

                referred="true"
                  console.log('Temporary 100 added to wallet:', wallet)
                  
                } else {
                  return res.status(400).json({ success: false, message: 'Referral code not found' });
                }
              }

            if(req.body.referralLink){
                reflink=req.body.referralLink;
                refuser=await collection.findOne({referallink:reflink});
                console.log("Referal User is",refuser);
                if(refuser){

                    refferedlink="true"
                    console.log('Temporary 100 added to wallet:', wallet);
                }else{
                    return res.status(400).json({success:false,message:"Referral link not found"});
                }
            }  

            
            
            const data = {
                Username: req.body.name,
                email: req.body.email,
                password: req.body.password,
                referalcode:req.session.referralCode,
                referallink:req.session.referralLink,
                wallet:referredUser || refuser ? 50:0,
            };
    
            req.session.userdb = data;
            
    
            // if (!isEmailValid(data.email)) {
            //     console.log("Invalid email");
            //     return res.render("register", { msg: "Please Enter a valid email" });
            // }
    
            // if (!data.Username || data.Username.trim() === "") {
            //     console.log("Username is empty");
            //     return res.render("register", { msg: "Username must be filled" });
            // }

            
            // if (!isPasswordValid(data.password)) {
            //     console.log("Invalid password");
            //     return res.render("register", { msg: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit" });
            // }


            const userdb = await collection.findOne({ email: data.email });
           
    
            if (!userdb) {

                userdetails={
                    Username:data.name,
                    email:data.email,
                    password:data.password,
                    isblocked:false,
                    referalcode:req.session.referralCode,
                    referallink:req.session.referralLink,
                    wallet:referredUser || refuser ? 50:0,
                }
               
                otp=generateOtp();

                setTimeout(() => {
                    otp = null;
                    console.log('deleted', otp);
                }, 300000);

                console.log("The OTP is "+otp);
                const mailstuffs={
                    from:"fifapstation@gmail.com",
                    to:userdetails.email,
                    subject:"OTP verification",
                    text:`Your OTP is ${otp} please dont share with others`,
                };

                transporter.sendMail(mailstuffs,(error,info)=>{

                    if(error){
                        console.log(error+"OTP ERROR");
                        res.render("register",{msg:"failed to send OTP"});
                    }else{
                        console.log("OTP Successfully send"+info.response);
                        console.log(req.session.userdb);
                        res.render("otppage",{msg:"OTP send successfully Please check your email"})
                    }
                });
                
              
                  const referralCode = generateReferralCode(8);
                  req.session.userdb.referalcode=referralCode
                  console.log(referralCode);

                  const baseUrl = 'http://localhost:5000/';

                  const referralLink = generateReferralLink(baseUrl);
                  req.session.userdb.referallink=referralLink;
                  console.log('Referral Link:', referralLink);

            } else {
                console.log("Email already exists");
                return res.render("register", { msg: "Email already exists" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.send("Oops! Something went wrong...");
        }
    },


    resendotpget:async(req,res)=>{
       try{
        
        otp=generateOtp();

        setTimeout(() => {
            otp = null;
            console.log('deleted', otp);
        }, 300000);

        console.log("The OTP is "+otp);
        const mailstuffs={
            from:"fifapstation@gmail.com",
            to:userdetails.email,
            subject:"OTP verification",
            text:`Your OTP is ${otp} please dont share with others`,
        };
        transporter.sendMail(mailstuffs,(error,info)=>{
            if(error){
                console.log(error+"OTP ERROR");
                res.render("register",{msg:"failed to send OTP"});
            }else{
                
                setTimeout(() => {
                    otp = null;
                    console.log('deleted', otp);
                }, 300000);

                console.log("OTP Successfully send"+info.response);
                console.log(req.session.userdb);
                res.redirect('/otppage')
            }
        });
       }catch(error){
        res.send("500").send("Internal Server Error");
       }
    },

    otpget:(req,res)=>{
        try {
            setTimeout(() => {
                otp = null;
                console.log('deleted', otp);
            }, 300000);

         res.render('otppage');
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Failed to render OTP page' });
        }
    },


    otppost: async (req, res) => {

        const { otpbox} = req.body;

        console.log('Entered OTP is:', otp);

        try {
            if (otp == otpbox) {

            await collection.insertMany([req.session.userdb]);

            if(refferedlink =="true"){
                await collection.updateOne({ referallink: reflink },{$inc:{wallet:100}})
    
                .then(y=>{
                console.log('updated',y);
                })
            }

            if(referred =="true"){
            await collection.updateOne({ referalcode: referral },{$inc:{wallet:100}})

            .then(x=>{
            console.log('updated',x);
            })
        }

            return res.render("login");
            } else {
            return res.render("otppage", { msg: "Incorrect OTP" });
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

          
    //product detail routes
    prodget:(req,res)=>{
        res.render("productdet",{productdata});
    },

    //home page routes
    homepageget:async(req,res)=>{
        const user=req.session.userdet
        // console.log(user);
        if(user){
            const productdb=await products.find()
            // console.log(productdb);
            res.render("userHome",{productdb});
        }else{
            res.render("login");
        };
    },


    proddetget:async(req,res)=>{
       try{
        const productid=req.params.id
        const productdata=await products.findById(productid).populate('category');
        const category=await categorym.findOne({_id:productdata.category})

        const offer=await offerm.findOne({$or:[{applicableProduct:productdata.productname},{applicableCategory:category.category}]});
        res.render('productdet',{productdata,offer,userId:req.session.userId});

       }catch(error){
        console.log(error);
        res.status(500).send("Failed to get Productpage");
       }
    },

    shopget: async (req, res) => {
        const user = req.session.userdet;
      
        if (user) {
          try {
            // Pagination parameters
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
      
            // Calculate the skip value based on the page and pageSize
            const skip = (page - 1) * pageSize;
      
            // Fetch total count of products for pagination calculation
            const totalCount = await products.countDocuments();
            
            // Calculate the total number of pages
            const totalPages = Math.ceil(totalCount / pageSize);
      
            // Fetch products with pagination
            const productdb = await products.find()
              .skip(skip)
              .limit(pageSize)
              .exec();
      
            res.render("shop", { productdb, page, pageSize, totalPages });
          } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
          }
        } else {
          res.render("userHome");
        }
    },



    searchget:async(req,res)=>{
        try {
            const searchQuery = req.query.search;
            let productFilter = {};
            let categoryFilter = {};
      
            if (searchQuery) {
              const regexPattern = new RegExp(searchQuery, "i");
      
              productFilter = { productname: { $regex: regexPattern }};
      
      
              categoryFilter = { category: { $regex: regexPattern }};
            }
      
            const matchingProducts = await products.find(productFilter)
            
            const response = {
              products: matchingProducts,
            };
      
            res.json(response);
          } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Error while searaching."});
       }
    },


    //logout routes
    logoutuser:(req,res)=>{
        req.session.destroy((error)=>{
            if(error){
                console.log(error)
            }
            res.render("userHome1");
        });
    },

}




module.exports=controls;