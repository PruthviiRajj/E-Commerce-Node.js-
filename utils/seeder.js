const Product = require('../models/products')
const dotenv = require('dotenv')
const connectDatabase = require('../config/database')

// importing to dummy data
const productData = require('../data/product.json')

//settinf env file
dotenv.config({
    path:'Backend/config/.env'
})

//connecting to database
connectDatabase()

const insertProduct = async () => {
    try {
        await Product.deleteMany()//delete many to entire database
        console.log("products are deleted")

        await Product.insertMany(productData)//insert multiple data into the database
        console.log('all products data inserted')

        process.exit()
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

//calling datainsertion function
insertProduct()
