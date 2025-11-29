const express = require('express')
const errorMiddle = require('./middleware/errors')
const cookieParser = require('cookie-parser')

const app = express()

//Parsing urlencoded body
app.use(express.urlencoded({extended: false}))



app.use(express.json())
app.use(cookieParser())

//import all Product routes
const products = require('./routes/product')
const auth = require('./routes/auth')
const order = require('./routes/order')


app.use('/api/v1',products)
app.use('/api/v1',auth)
app.use('/api/v1',order)

//Middleware to handle error
app.use(errorMiddle)



module.exports = app