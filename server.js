const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')


process.on('uncaughtException',err=>{
    console.log(`ERROR:: ${err.message}`)
    console.log('unCaughtException');
    process.exit(1)    
})




// Setting ENV file
dotenv.config({
    path:"Backend/config/.env"
})

// Connecting to database
connectDatabase()

app.listen(process.env.PORT,()=>{
    console.log(`SERVER STARTED ON PORT : ${process.env.PORT} in ${process.env.NODE_ENV}`)
})


process.on('unhandledRejection', err => {
    console.log(`ERROR:: ${err.message}`)
    console.log('Shutting Down the server due to unhandled promise');
    server.close(()=>{
        process.exit(1)
    })
})
