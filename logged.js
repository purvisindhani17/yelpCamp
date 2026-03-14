const express=require('express');
const Campground=require('./models/campground');
const Review=require('./models/review');
const {campgroundSchema,reviewSchema}=require('./schemas');
const expressError=require('./utility/expressApp');
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        delete req.session.returnTo;
    }
    next();
}
module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        console.log(req.session);
        return res.redirect('/login');
    }
    next();
}
module.exports.validate=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new expressError(msg,400);
    }else{
        next();
    }
}
module.exports.isrevauthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const campground=await Campground.findById(id);
     const review = await Review.findById(reviewId);
   if(!review.author.equals(req.user._id)){
        req.flash('error','You cannot access it');
        return res.redirect(`/campgrounds/show/${campground.id}`)
    } 
    next();
}
module.exports.isauthor=async(req,res,next)=>{
    const {id}=req.params;
     const campground = await Campground.findById(id);
   if(!campground.author.equals(req.user._id)){
        req.flash('error','You cannot access it');
        return res.redirect(`/campgrounds/show/${campground.id}`)
    } 
    next();
}