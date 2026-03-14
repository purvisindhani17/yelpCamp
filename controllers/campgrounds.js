const Campground=require('../models/campground');
const cloudinary=require('../cloudinary');

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};
module.exports.rendnew=(req,res)=>{
    res.render('campgrounds/new');
};
module.exports.createNew=async(req,res)=>{ 
     console.time("RenderTime");
    // if(!req.body.campground) throw new expressError('Invalid Campground Data',400);
      const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const newCampground=new Campground(req.body.campground);
    newCampground.geometry = geoData.features[0].geometry;
    newCampground.location = geoData.features[0].place_name;
   newCampground.Image = req.files.map(f => ({
    url: f.path,
    filename: f.filename
}));
    newCampground.author=req.user._id;
    await newCampground.save();
    req.flash('success',"hey you have built a new Campground");
    
    res.redirect(`/campgrounds/show/${newCampground._id}`);

};
module.exports.show=async(req,res)=>{
    const {id}=req.params;
    
    const campground=await Campground.findById(id).populate(
        {path:'review',
        populate:{
            path:'author'
        }}).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error','Cannot find!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
};
module.exports.rendedit=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    
    if(!campground){
        req.flash('error','Cannot find!')
        return res.redirect('/campgrounds');
    }
   
    res.render('campgrounds/edit',{campground});
};
module.exports.edit=async(req,res)=>{
    const {id}=req.params;
    console.log(req.body);
     const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const campground=await Campground.findByIdAndUpdate(id,req.body.campground);
        campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    const imgs=req.files.map(f => ({
    url: f.path,
    filename: f.filename
}));
    campground.Image.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull :{Image:{filename:{$in:req.body.deleteImages}}}})
        console.log(campground);
    }
    req.flash('success','successfully updated ')
    res.redirect(`/campgrounds/show/${campground._id}`);
};
module.exports.delete=async(req,res)=>{
    const {id}=req.params;
   
    await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted ')
    res.redirect('/campgrounds');
};