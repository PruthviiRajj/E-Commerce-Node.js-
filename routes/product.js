const express = require('express')
const router =  express.Router()

const {getProducts, newProduct, updateProduct, getSingleProduct, deleteProducts, createProductReview, getProductReviews, deleteReviews} = require('../controllers/product_controller')

const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth')

router.route('/products').get(getProducts)
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct)
// router.route('/admin/product/:id').put(updateProduct)
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct).delete(isAuthenticatedUser, deleteProducts)
router.route('/product/:id').get(getSingleProduct)
router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews').get(isAuthenticatedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReviews)
    
module.exports = router