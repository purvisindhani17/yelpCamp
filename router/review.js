const express=require('express');
const router=express.Router({mergeParams:true});
const {campgroundSchema,reviewSchema}=require('../schemas');
const Campground=require('../models/campground');
const expressError=require('../utility/expressApp');
const asyncf=require('../utility/async');
const review=require('../controllers/reviews')

const {isloggedin,isrevauthor}=require('../logged')
const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    console.log(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new expressError(msg,400);
    }else{
        next();
    }
}

router.post('/',isloggedin,validateReview,asyncf(review.rendNew))

router.delete('/:reviewId',isloggedin,isrevauthor,asyncf(review.delete));

module.exports=router;