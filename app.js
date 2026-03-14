if(process.env.NODE_ENV!='production'){
    require('dotenv').config();
}
const express=require('express');
const app=express();
 
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const port=process.env.PORT || 3000;
const path=require('path');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user')
const joi =require('joi');

const mongoose=require('mongoose');
// const dburl=process.env.DB_URL;
const dburl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp-test';


mongoose.connect(dburl).then(()=>{
    console.log("MONGO CONNECTION OPEN!!!");
}).catch(err=>{
    console.log("OH NO MONGO CONNECTION ERROR!!!!",err);
})
const flash=require('connect-flash');
const expressError=require('./utility/expressApp');
const session=require('express-session')
const { MongoStore } = require('connect-mongo');
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize')
const secret=process.env.SECRET ||'thisisabettersecret';

const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret:secret,
    }
});
store.on("error",function(e){
    console.log("session error has occured",e)
})
const sessionconfig={
    store,
    name:'blah',
    httpOnly:true,
    // secure:true
    secret:secret,

    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }

}
app.use(session(sessionconfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
const ejsMate=require('ejs-mate');
app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended: true }));
const methodOverride=require('method-override');
app.use(methodOverride('_method'));
const campRouter=require('./router/campgrounds')
const reviewRouter=require('./router/review')
const userRouter=require('./router/user')

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
// const campground = require('./models/campground');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ducrbgurt/",
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(flash());
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.use(express.static(path.join(__dirname,'/public')));
app.use('/campgrounds',campRouter);
app.use('/campgrounds/:id/reviews',reviewRouter)

app.use('/',userRouter);
app.get('/',(req,res)=>{
    res.render('home');
});
app.use(mongoSanitize());


app.all(/(.*)/,(req,res,next)=>{
    next(new expressError('Page Not Found',404));
});
app.use((err,req,res,next)=>{
    
    const {statusCode=500}=err;
    if(!err.message) err.message='Something Went Wrong';
    if (err.name === "CastError") {
    err.statusCode = 400;
    err.message = "Page not found";
    }
    res.status(statusCode).render('err',{err});
})

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);   
});