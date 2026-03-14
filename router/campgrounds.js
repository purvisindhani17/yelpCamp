const express=require('express');
const router=express.Router();
const multer=require('multer');
const {storage}=require('../cloudinary')
const upload = multer({ storage});


const campground = require('../controllers/campgrounds');const expressError=require('../utility/expressApp');
const {campgroundSchema,reviewSchema}=require('../schemas');
const asyncf=require('../utility/async');
const {isloggedin,validate,isauthor}=require('../logged')

router.route('/')
    .get(asyncf(campground.index))
    .post(isloggedin,upload.array('campground[Image]'),validate,asyncf(campground.createNew));
    // .post( upload.array('campground[Image]'), (req, res) => {
    // console.log(req.body,req.files)
    // res.send('Uploaded!');
// });
router.get('/new',isloggedin,campground.rendnew)

router.get('/show/:id',asyncf(campground.show));
router.get('/:id/edit',isloggedin,isauthor,asyncf(campground.rendedit));
router.route('/:id')
    .put(isloggedin,isauthor,upload.array('campground[Image]'),validate,asyncf(campground.edit))
    .delete(isloggedin,isauthor,asyncf(campground.delete));

module.exports=router;