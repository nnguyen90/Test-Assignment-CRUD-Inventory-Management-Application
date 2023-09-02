// ------------------
//   SERVER SETUP 
// ------------------
const express = require('express');
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const app = express();
const productService = require('./services/product-service');
const userService = require('./services/user-service');
const User = require('./services/user-service');
require('dotenv').config({ path: './.env' });
const HTTP_PORT = process.env.PORT || 8080;

// ----------------------
//   JSON WEB TOKEN SETUP 
// ----------------------
// let ExtractJwt = passportJWT.ExtractJwt;
// let JwtStrategy = passportJWT.Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Configure jwt options
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('jwt'),
    secretOrKey: 'thynguyen',
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    if (!jwt_payload._id) {
        return next(null, false);
    }
    User.findById(jwt_payload._id)
        .then(user => {
            if (user) {
                next(null, user);
            } else {
                next(null, false);
            }
        })
        .catch(err => console.error(err));
});

passport.use(strategy);
app.use(passport.initialize());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// To connect collections in mongoDB
Promise.all([
    userService.connect(),
    productService.connect()
]).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("API listening on: " + HTTP_PORT);
    });
}).catch(err => console.log(err));

// ------------------
//   ENDPOINTS SETUP 
// ------------------

app.get('/', (req, res) => {
    res.json({ message: 'Server is listening'});
});

// Register new user
app.post ('/register', (req, res) => {
    userService.registerUser(req.body).then((user) => {
        let payload = { 
            _id: user._id,
            username: user.username,
            role: user.role
        };

        let token = jwt.sign (payload, jwtOptions.secretOrKey);
       
        res.json({"message": user, "token": token});
    }).catch(msg=>{
        res.status(422).json({message: msg});
    });
})

// Login to an account
app.post ('/login', (req, res) => {
    userService.checkUser(req.body).then ((user) => {
        let payload = { 
            _id: user._id,
            username: user.username,
            role: user.role
        };

        let token = jwt.sign (payload, jwtOptions.secretOrKey);
        res.json ({ "message": "login successful", "token" : token });
    }).catch ((msg) => {
        res.status (422).json ({ "message" : msg });
    });
})

// Get all products
app.get ('/items', async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const perPage = +req.query.perPage || 10;
        const name = +req.query.name || '';
        
        //const product = await db.getAllItem(page, perPage, name);
        productService.getAllItem(page, perPage, name).then((data) => { res.json(data)})
       
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve inventory.' });
    }
})

// Get one product
app.get ('/items/:id', async (req, res) => {
    
    try {
        const proId = req.params.id;
        console.log(proId)
        const product = await productService.getItemByID(proId);
        if (product) {           
          res.json(product);
        } else {
          res.status(404).json({ error: 'Item not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve item.' });
    }
})

// Add new product
//app.post('/items/add', passport.authenticate('jwt', { session: false }), userService.isAdmin, async (req, res) => {
app.post('/items/add', async (req, res) => {
    //console.log (req.user.role)
    //if (req.user._id && req.user.role === 'admin') {
        try {
            const newProduct = await productService.addNewItem(req.body);
            await newProduct.save();
            return res.status (201).json ({
                message: 'Item added successfully',
                product: newProduct
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to add new product.' });
        }
    // }
    // else {
    //     res.status (403).json ({ message: "Access denied"})
    // }
});

// Edit a product
// app.put('/items/edit/:id', passport.authenticate('jwt', { session: false }),async (req, res, next) => {
app.put('/items/edit/:_id', async (req, res) => {
    //if (req.user && req.user.role === 'admin') {
        try {
            const updatedProduct = await productService.updateItemByID (req.body, req.params._id);           
            await updatedProduct.save();        
            return res.status (200).json ({
                message: 'Item updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update item.' });
        }
    //}
    // else {
    //     res.status (403).json ({ message: "Access denied"})
    // }
});

// Delete a product
//app.put('/items/delete/:_id', passport.authenticate('jwt', { session: false }),async (req, res, next) => {
app.delete('/items/delete/:id', async (req, res) => {
    //if (req.user && req.user.role === 'admin') {
        console.log ("This is Delete Endpoint in server")
        console.log (req.params.id)
      try {
        const result = await productService.deleteItemByID (req.params.id);
        console.log (res.result);
        if (result.deletedCount === 1) {
            return res.json ({ message : 'Item deleted successfully'});
        } else {
            return res.status (404).json ({ error: 'Failed to delete item'})
        }
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete item.' });
      }
    //}
    // else {
    //     res.status (403).json ({ message: "Access denied"})
    // }
});

app.use((req, res) => {
    res.status(404).end();
});