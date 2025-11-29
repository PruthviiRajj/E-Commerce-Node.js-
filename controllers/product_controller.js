const Product = require('../models/products')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const APIfeature = require('../utils/apifeatures')
const User = require('../models/user')


// Display all products => api/v1/products/keyword=kd[GET]
exports.getProducts = catchAsyncError(async (req,res,next) =>{

    const resParPage = 4

    const productCount = await Product.countDocuments()

    // console.log(req.query)
    const apifeatures = new APIfeature(Product.find(),req.query).search().filter().pagination(resParPage)
    const getAllProducts = await apifeatures.query //find() == SELECT * FROM x

    res.status(200).json({
        success : true,
        count : getAllProducts.length,
        productCount,
        getAllProducts
    })
})

//Get single product Details=> /api/v1/product/:id[GET]
exports.getSingleProduct = catchAsyncError(async (req, res, next)=>{
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler('product not found', 404))
        // return res.status(404).json({
        //     success: false,
        //     message: 'Product not found'
        // })
    }
    res.status(200).json({
        success: true,
        product
    })
}) 

//Create new product => /api/v1/admin/product/new [post]
exports.newProduct = catchAsyncError(async (req,res,next)=>{

    // req.body.user = req.user.id
    
    console.log(req.body)
    //Saving data to the database
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})

// Update product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler('product not found', 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true,
        useFindAndModify : false
    })
    res.status(200).json({
        success: true,
        product
    })
})

exports.deleteProducts = catchAsyncError(async (req, res, next) =>{
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler('product not found', 404))
    }
    await Product.deleteOne(product)//deleting the product
    res.status(200).json({
        success: true,
        message: 'Poduct Deleted'
    })
})

//Create new review => /api/v1/review[POST/PUT]

exports.createProductReview = catchAsyncError(
    async(req, res, next) => {
        const { name,rating,comment, productId } = req.body

        const review = {
            user:req.user._id,
            name:req.user.name,
            rating: Number(rating),
            Comment:comment
        }        

        const product = await Product.findById(productId)
        
        // console.log(product)
        const isReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())
        // console.log(isReviewed)
        if(isReviewed){
            product.reviews.forEach(review => {
                
                if(review.user.toString() === req.user._id.toString()){
                    review.Comment = comment
                    review.rating = rating
                    review.name = name
                }
            });
        }else{
            // console.log(review)
            product.reviews.push(review)
            product.numberOfReviews = product.reviews.length
        }        
        
        product.ratings = product.reviews.reduce((acc, item)=>item.rating + acc, 0)/
        product.reviews.length
        
        await product.save({validateBeforeSave: false})

        res.status(200).json({
            success:true
        })
    }
)

//Get product reviews => /api/v1/reviews[GET]
exports.getProductReviews = catchAsyncError(
    async(req, res, next) => {
        const product = await Product.findById(req.query.id)

        res.status(200).json({
            success: true,
            reviews: product.reviews
        })
    }
)

//Delete Product Reviews => /api/v1/reviews[DELETE] [productId, id]
exports.deleteReviews = catchAsyncError(
    async(req, res, next) => {
        
        const product = await Product.findById(req.query.productId)
        
        const reviews = product.reviews.filter(review => review.user.toString() !== req.query.id.toString())

        const numberOfReviews = reviews.length

        const ratings = product.reviews.reduce((acc, item)=>item.rating + acc, 0)/
        product.reviews.length

        await Product.findByIdAndUpdate(req.query.productId,{
            reviews,
            ratings,
            numberOfReviews
        },{
            new:true,
            runValidators:true
        })

        res.status(200).json({
            success:true
        })
    }
)

