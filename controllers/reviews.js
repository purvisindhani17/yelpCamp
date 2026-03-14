const Campground=require('../models/campground');
const Review=require('../models/review')
module.exports.rendNew=async(req,res)=>{
    const campground= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author=req.user._id;
    campground.review.push(review);
    await campground.save();
    await review.save();
    req.flash('success','review added ')
    res.redirect(`/campgrounds/show/${campground._id}`);
};
module.exports.delete=async(req,res)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','successfully deleted ')
    res.redirect(`/campgrounds/show/${id}`)
}