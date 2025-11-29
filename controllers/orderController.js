const Order = require('../models/order')
const Product = require('../models/products')
const User = require('../models/user')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')

//Create a new order => /api/v1/order/new[POST]
exports.newOrder = catchAsyncError(
    async(req, res, next) =>{
        const {
            orderItems,
            shipingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body
        console.log(req.body)

        const order = await Order.create({
            orderItems,
            shipingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            user:req.user._id,
            paidAt:Date.now()
        })

        res.status(200).json({
            success:true,
            order   
        })
    }
)

//Get single Order => /api/v1/order/:id[GET]
exports.getSingleOrder = catchAsyncError(
    async(req, res, next) => {
        const order = await Order.findById(req.params.id).populate('user','name email')

        if(!order){
            return next(new ErrorHandler('No order found with this id',404))
        }

        res.status(200).json({
            success:true,
            order
        })
    }
)



//Get all orders => /api/v1/orders/me[GET]
exports.myOrder = catchAsyncError(
    async(req, res, next) => {        
        const orders = await Order.find({
            user:req.user.id
        })
        
        res.status(200).json({
            success:true,
            orders
        })
    }
)

//ADMIN

//GET all orders - ADMIN => /api/v1/admin/orders[get]
exports.allOrders = catchAsyncError(
    async(req, res, next) => {        
        const orders = await Order.find()

        let totalamount = 0
        orders.forEach(order => {
            totalamount = totalamount + order.totalPrice
        });
        
        res.status(200).json({
            success:true,
            totalamount,
            orders
        })
    }
)

// update / process order - ADMIN => /api/v1/admin/order/:id[put]
exports.updateOrder = catchAsyncError(
    async(req, res, next) => {
        const order = await Order.findById(req.params.id)        

        if(order.orderStatus === 'Delivered'){
            return next(new ErrorHandler('Order already delivered',400))
        }

        order.orderItems.forEach(async item => {
            await updatestock(item.product, item.quantity)
        })

        order.orderStatus = req.body.status

        order.deliveredAt = Date.now()
        await order.save()

        res.status(200).json({
            success: true
        })
    }
)

//Update stock
async function updatestock(id, quantity){
    const product = await Product.findById(id)    
    
    product.stock = product.stock - quantity
    
    await product.save()    
}

//Delete order => /api/v1/admin/order[DELETE]
exports.deleteOrder = catchAsyncError(
    async(req, res, next) => {
        const order = await Order.findById(req.params.id)        
    
        if(!order){
            return next(new ErrorHandler('No Order found with this id', 404))
        }

        await order.deleteOne()

        res.status(200).json({
            success: true
        })
    }
)
