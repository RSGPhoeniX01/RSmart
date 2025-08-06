import express from 'express'
import {checkLoginStatus,getSellers,getAllPurchases,getUsers,deleteUser,sendEmailOtp,signIn,updateUser,signOut, getDetails, getWishlist, toggleWishlist, verifyEmailOtp, register} from '../controllers/user.controller.js'
import validateUser from '../middleware/user.middleware.js';
const router=express.Router();

router.post('/signup',sendEmailOtp)
router.post('/signout',signOut)
router.post('/signIn',signIn)
router.put('/:userId/update',validateUser,updateUser)
router.delete('/:userId/delete',validateUser,deleteUser)
router.get('/purchases', validateUser, getAllPurchases)// for my use only not in website
router.get('/wishlist', validateUser, getWishlist);
router.post('/wishlist/toggle', validateUser, toggleWishlist);
router.get('/:userId/purchases', validateUser, getAllPurchases)
router.get('/allusers',getUsers)// for my use only not in website
router.get('/allSellers',getSellers)// for my use only not in website
router.get('/:userId',validateUser,getDetails)
router.get('/me', validateUser,checkLoginStatus);
router.post('/verify-email-otp', verifyEmailOtp)
router.post('/register', register)

export default router