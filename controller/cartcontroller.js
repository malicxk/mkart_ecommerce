const express=require("express");
const app=new express();
const session=require('express-session')

const cartm=require("../model/cartm");
const productm=require("../model/products");

const userm=require("../model/user");
const addressm=require("../model/addressm");
const orderm=require("../model/orderm");

const couponm=require("../model/couponm");
const offerm=require("../model/offerm");
const category = require("../model/category");


const nocache=require("nocache");

const { offermanget } = require("./admincontroller");
app.use(nocache());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

 

const controls={
    
    cartpageget:async(req,res)=>{
        console.log("Entered in to cart page get");
        if(req.session.userid){
            try {
                const cartItems = await cartm.find({ userid: req.session.userid});
                const offersForProducts = [];
              
                for(const cartItem of cartItems){
                    const product =await productm.findById(cartItem.productid);
                    const categorydata= await category.findById(product.category);

                    const offer=await offerm.findOne({$or:[{applicableProduct:product.productname},{applicableCategory:categorydata.category}]});

                    offersForProducts.push({
                        cartItem: cartItem,
                        offer: offer ? offer : null,
                    });
                }
                
                console.log(offersForProducts)

                if (cartItems.length > 0) {
                    res.render("cartpage", { cartItems,offers:offersForProducts,userId:req.session.userId,message:""});
                } else {
                    res.render("cartpage", { cartItems: [] }); 
                }
            } catch (error) {
                console.log(error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        }else{
            res.redirect("/login");
        }   
    },
    
    addtocartget:async(req,res)=>{
        const userId = req.session.userid;
        const productId = req.params.id;
        const cart = await cartm.findOne({ userid: userId, productid: productId });
        if (cart != null) {
            const product = await productm.findById(cart.productid);
            if (product.stock > cart.quantity) {
                
            cart.quantity++;
            cart.save();
            }
            res.redirect("/cart");
        } else {
            const userData = await userm.findOne({ _id: userId });
            const productData = await productm.findOne({ _id: productId });

            const newCart = new cartm({
            userid: userData._id,
            Username: userData.Username,
            productid: productData._id,
            product: productData.productname,
            price: productData.price,
            quantity: 1,
            img: productData.img[0],
            });
    
            newCart.save();
            res.redirect("/cart");
        }
    },

    removecartget:async(req,res)=>{
       const productId=req.params.id;
       const cart=await cartm.findByIdAndDelete(productId)
       res.redirect("/cart");
    },

    addquantityget:async(req,res)=>{
       const productId=req.params.id;
       const cart=await cartm.findOne({_id:productId});
       const product = await productm.findById(cart.productid)

       if (product.stock > cart.quantity) {
        cart.quantity++;
        cart.save();

        res.json({ updatedQuantity: cart.quantity });
      } else {

        res.json({ updatedQuantity: cart.quantity,message: "Maximum stock reached"  });
        
      }
    },

    subquantityget:async(req,res)=>{
       const productId=req.params.id;
       const cart=await cartm.findOne({_id:productId});
       if(cart.quantity>1){
        cart.quantity--;
        cart.save();
        res.json({updatedQuantity:cart.quantity})
       }else{
        res.redirect("/cart");
       }
    },



//checkoutt routesssssssssssssssssss


    checkoutget:async(req,res)=>{
        const id=req.session.userid;
        const userCart=await cartm.find({userid:req.session.userid});

        const user=req.session.userid;
        const userdetails=await userm.findOne({_id:user});

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

        const coupondata=await couponm.find();
        if (userCart.length > 0) {
           
            let totalPriceAfterOffers = 0;
          
            for (const cartItem of userCart) {
              const matchingOffer = offersForProducts.find(offerItem => offerItem.cartItem.product === cartItem.product && offerItem.offer !== null);
              const itemPrice = matchingOffer ? cartItem.price - (cartItem.price * matchingOffer.offer.discount / 100) : cartItem.price;
              totalPriceAfterOffers += cartItem.quantity * itemPrice;
            }
          
            const useraddress = await addressm.find({ userid: id });
            const totalQuantity = userCart.reduce((total, item) => total + item.quantity, 0);

            res.render("checkoutpage",{userCart,offers:offersForProducts,useraddress,totalQuantity,totalPrice: totalPriceAfterOffers,coupondata,userdetails})
        }else{
            res.redirect("/cart");
        }
       
    },

    checkoutpost: async (req, res) => {
        try {
            const userId = req.session.userid;
            const userCart = await cartm.find({ userid: userId });
            const currentDate = new Date();


            const couponcode = req.body.Couponcode;
            const coupon = await couponm.findOne({ couponcode: { $regex: new RegExp(couponcode, 'i') } });

        
            const productCollectionArray = [];
        
            for (const item of userCart) {
              // Fetch the applicable offer for the product
              const product = await productm.findById(item.productid);
              const categoryData = await category.findById(product.category);
              const offer = await offerm.findOne({
                $or: [
                  { applicableProduct: product.productname },
                  { applicableCategory: categoryData.category },
                ],
                expiryDate: { $gte: currentDate }, // Ensure the offer is still valid
                isActive: true,
              });
        
              // Calculate the discounted price or use the original price if no offer is found
              const discountedPrice = offer
                ? item.price - item.price * (offer.discount / 100)
                : item.price;
        
              const productData = {
                productid: item.productid,
                productname: item.product,
                price:discountedPrice,
                discount:coupon.discount,
                quantity: item.quantity,
                status: "pending",
              };
        
              productCollectionArray.push(productData);
            }
        
            const newOrder = {
              userid: req.session.userid,
              username: userCart[0].Username,
              productcollection: productCollectionArray,
              address: req.body.selectedAddress,
              orderdate: currentDate,
              paymentmode: req.body.paymentMethod,
            };
        
            await orderm.create(newOrder);
        
            // Update stock for each product
            for (const item of userCart) {
              await productm.updateOne(
                { _id: item.productid },
                { $inc: { stock: -item.quantity } }
              );
            }
        
            // Clear the user's cart after ordering
            await cartm.deleteMany({ userid: req.session.userid });
        
            res.render('orderconfirmedpage');
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          }
      },


      couponpost:async(req,res)=>{
        try {
            console.log('enter the controller');
            let currentDate = new Date();
            const couponcode = req.body.Couponcode;
            console.log("couponcode: ",couponcode)
            if (req.session.coupon && couponcode.toLowerCase() === req.session.coupon.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code has already been applied.',
                });
            }
            const coupon = await couponm.findOne({ couponcode: { $regex: new RegExp(couponcode, 'i') } });
            console.log(coupon)
            if(coupon && coupon.couponcode === couponcode){
              if (coupon && coupon.expirydate > currentDate && couponcode.toLowerCase() === coupon.couponcode.toLowerCase()) {
            
                const discountAmount = coupon.discount;
                console.log(discountAmount);
                const amountLimit = coupon.purchaseamount;
                req.session.coupon = coupon.couponcode;
        
                return res.json({ success: true, discount: discountAmount, amount: amountLimit });
              }else{
                return res.status(404).json({
                    success: false,
                    message: ' coupon code expired.',
                });
              }
            }else{
              return res.status(400).json({
                success:false,
                message: 'Invalid coupon'
              })
            }
           } catch (error) {
            console.error('Error in couponcheck:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during coupon validation.',
            });
        }
      },


      
    walletpay:async(req,res)=>{
        try {
            console.log("Entered wallet payment ");
            const userId = req.session.userid;
            const user = await userm.findById(userId);
        
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        
            // Access the selected address, payment mode, and total overall price from req.body
            const selectedAddress = req.body.selectedAddress;
            const paymentMode = req.body.paymentMode;
            const totalOverallPrice = req.body.totalOverallPrice;
        
            const usercart = await cartm.find({ userid: userId });
            const today = new Date();
            const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const todaydate = today.toLocaleString('en-US', options);
            const deliveryDate = new Date(today);
            deliveryDate.setDate(today.getDate() + 4);
            const deliveryDateString = deliveryDate.toLocaleString('en-US', options);
        
            let walletAmount = user.wallet;
            console.log('wallet amount before', walletAmount);
            let productData;
            const productCollectionArray = [];
            let totalPrice = 0;
        
            for (const item of usercart) {
                productData = {
                    productid: item.productid,
                    productname: item.product,
                    price: item.price,
                    quantity: item.quantity,
                    status: "pending"
                };
        
                productCollectionArray.push(productData);
                totalPrice += item.price * item.quantity;
        
                // Update product stock
                await productm.updateOne(
                    { _id: item.productid },
                    { $inc: { Stock: -item.quantity } }
                );
            }
        
            const orderData = {
                userid: req.session.userid,
                username: usercart[0].user, // Assuming username is the same for all cart items
                productcollection: productCollectionArray,
                orderdate: todaydate,
                deliverydate: deliveryDateString,
                address: selectedAddress,
                paymentmode: paymentMode,
            };
        
            console.log('values are on ordering', orderData);
        
            // Check if the user has enough funds in the wallet
            if (walletAmount >= totalPrice) {
                // Create a single order document with an array of cart items
                await orderm.create(orderData);
        
                // Deduct amount from the user's wallet
                walletAmount -= totalPrice;
                user.wallet = walletAmount;
                await user.save();
        
                // Delete user's cart
                await cartm.deleteMany({ userid: req.session.userid });
        
                console.log('wallet amount after', walletAmount);
        
                // Popup HTML for order received
                const popupHTML = `
                <div class="popup-container">
                    <p>Your order has been received!</p>
                </div>
                <script>
                    setTimeout(() => { 
                        window.location.href = '/userHome';
                    }, 3000);
                </script>
                `;
        
                res.json({ popupHTML });
            } else {
                // Insufficient funds in the wallet
                res.status(400).json({ success: false, message: 'Insufficient funds in the wallet.' });
            }
        
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

      

};

module.exports=controls;