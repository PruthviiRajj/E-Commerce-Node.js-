const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name :{
        type: String,
        required: [true,'Please enter product name'],
        trim: true,
        maxLength: [100,'Product name cannot exceed 100 characters']
    },
    price :{
        type: Number,
        required: [true,'Please enter product price'],
        maxLength: [5,'Product name exceed 5 characters'],
        default: 0.0
    },
    description :{
        type: String,
        required: [true,'Please enter product description'],
    },
    ratings :{
        type: Number,
        default: 0
    },
    images :[
        {
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            }
        }
    ],
    category :{
        type: String,
        require: [true,'Please select category for this product'],
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Sports',
                'Home',
                'Outdoor',
                'Clothes/shoes',
                'Beauty/Health',
                'Books',
                'Games'
            ],
            message: 'Please select correct product category'
        }
    },
    seller :{
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock :{
        type: Number,
        required: [true,'Please enter product stock'],
        maxLength: [5,'Product name exceed 5 characters'],
        default: 0
    },
    numberOfReviews :{
        type: Number,
        default: 0
    },
    reviews :[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref: 'user',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type:Number,
                required: true
            },
            Comment:{
                type:String,
                required: false
            }
        }
    ],
    createdAt :{
        type: Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('product',productSchema)