const mongoose = require('mongoose')


const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_LOCAL_URI).then(con =>{
        console.log('MongoDB Database Connected with host')
    })
}

module.exports = connectDatabase