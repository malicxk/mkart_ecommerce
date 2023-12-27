const express = require("express");
const router = express.Router();
const app = new express();
const Razorpay=require('razorpay')
//for product image uploading
const path = require("path");
const multer = require("multer");



//mongodb models importing
const collection = require("../model/user");
const category = require("../model/category");
const product = require("../model/products")



const products = require("../model/products");
const userm = require("../model/user");
const profilem = require("../model/profilem");
const cartm = require("../model/cartm");
const profilepicm = require("../model/profilepicm");
const orderm = require("../model/orderm");
const addressm = require("../model/addressm");
require('dotenv').config()

//nocache
const nocache = require("nocache");
app.use(nocache());

console.log('id is',process.env.KEY_ID);
const controls = {
  razorpost: async (req, res) => {
    try {
        var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
        var options = {
            amount: req.body.amount, // Use the amount received from the frontend
            currency: "INR",
            receipt: "order_rcptid_11",
        };

        // Creating the order
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating order");
                return;
            }

            console.log(order);
            // Add order details to the response object
            res.send({ orderId: order.id });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
}
module.exports = controls;