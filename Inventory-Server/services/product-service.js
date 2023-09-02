const mongoose = require ('mongoose');

// Mongo connection:
const mongoDBString = "mongodb+srv://dbUser:Tiggy2986@cluster0.9biuzjl.mongodb.net/inventory?retryWrites=true&w=majority";

// Inventory Schema:
const Schema = mongoose.Schema;
const productSchema = new Schema({
    id: String,
    name: String,
    quantity: Number
});

let Product;

// Database Connection function
module.exports.connect = function () {
    return new Promise (function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBString, {useNewUrlParser: true});

        db.on ('error', (err) => { reject (err)} );
        db.once ('open', () => {
            Product = db.model ("products", productSchema);
            resolve();
        });
    });
}

// To get all products
module.exports.getAllItem = function (page, perPage, name) {
    return new Promise (async function (resolve, reject) {
        let findBy = {};
        
        if (name) {
            findBy = {
                name: { 
                    $regex: new RegExp (name, 'i')
                }
            }
        };

        if (+page && +perPage) {
            const products =  await Product.find (findBy)
            .sort ( {name : 1} )
            .skip ((page - 1) * +perPage)
            .limit (+perPage)
            .exec ();

            resolve(products);
        } else {
            reject (new Error("page and perPage must be valid numbers"));
        };
    });
}

// Get one product
module.exports.getItemByID = function (id) {
    return new Promise (async function (resolve, reject) { 
        try {
            const product = await Product.findOne({id: id}).exec();
            if (product) resolve (product);
            else reject (new Error ( `${id} not found`));
        } catch (error) {
            console.log(error)
            reject (error);
        }
    });
}

// Add new product
module.exports.addNewItem = function (data) {
    return new Promise (async function (resolve, reject) { 
       try {
        const newItem = await new Product (data).save ();
        resolve (newItem);
       } catch (error) {
            reject (error);
       };
    });
}

// Update an existing item
module.exports.updateItemByID = async function (data, _id) {
    console.log("Data in Product service in Server",data)
    console.log("_id in Product service in Server",_id)
    const result = await Product.updateOne({ _id: _id }, { $set: data }).exec();

    if (result.matchedCount > 0) {
        const updatedProduct = await Product.findOne({ _id: _id });
        return updatedProduct;
    } else {
        throw new Error(`Failed to update item with ID ${_id}`);
    }
}

// Delete an item
module.exports.deleteItemByID = function (id) {
    return new Promise (async function (resolve, reject) { 
        try {
            const result = await Product.deleteOne ({id: id}).exec ();
            if (result.deleteCount > 0) resolve (result);
            else reject (new Error (`Failed to delete item with ID ${id} `))
        } catch (error){
            reject (error);
        }
    });
}