const mongoose = require ('mongoose');
const bcrypt = require ("bcryptjs");

// Mongo connection:
const mongoDBString = "mongodb+srv://dbUser:Tiggy2986@cluster0.9biuzjl.mongodb.net/inventory?retryWrites=true&w=majority";

// User Schema:
const Schema = mongoose.Schema;
let userSchema = new Schema ({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    role: String
});

let User;

module.exports = mongoose.model('User', userSchema);

// Database connection function
module.exports.connect = function() {
    return new Promise (function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBString, {useNewUrlParser: true});

        db.on ('error', (err) => { reject (err)} );
        db.once ('open', () => {
            User = db.model ("users", userSchema);
            resolve(User);
        });
    });
}



// To Register a new User:
module.exports.registerUser = function (userData) {
    return new Promise (async function (resolve, reject) {
            await bcrypt.hash (userData.password, 10).then (hash =>{
                userData.password = hash;

                let newUser = new User (userData);
                newUser.save().then(() => {
                    resolve (newUser);
                }).catch (err => {
                    if (err.code == 11000) reject ("User Name already taken");
                    else reject ("There was an error creating the user: " + err);
                })
            }).catch (err => reject (err));
    });
}

// To Verify User:
module.exports.checkUser = function (userData) {
    return new Promise (function (resolve, reject) {
        User.find ({ username: userData.username})
        .limit (1)
        .exec ()
        .then ((users) => {
            if (users.length == 0) reject ("Unable to find user " + userData.username);
            else {
                bcrypt.compare (userData.password, users[0].password).then ((res) => {
                    if (res === true) resolve (users[0]);
                    else reject ("Incorrect Password for user " + userData.username);
                });
            };
        }).catch ((err) => { reject ("Unable to find user " + userData.username)});
    });
}

module.exports.isAdmin = function (req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied" });
    }
};
