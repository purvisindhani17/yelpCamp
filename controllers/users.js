const User=require('../models/user');
module.exports.regUser=(req,res)=>{
    res.render('user/register')
};
module.exports.register=async(req,res,next)=>{
    try{const{username,email,password}=req.body;
    const user=new User({email,username});
    const regUser=await User.register(user,password);
    console.log(regUser);
    req.login(regUser,err=>{
        if(err) return next(err);
        req.flash('success','Welcome to the YelpCamp!');
        res.redirect('/campgrounds');
    })
    
}catch(e){
    req.flash('error',e.message);
    res.redirect('/register');
}
};
module.exports.Rendlogin=(req,res)=>{
    res.render('user/login')
};
module.exports.login=async (req,res)=>{
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    req.flash('success',"Welcome back");
    res.redirect(redirectUrl);
};
module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        const redirectUrl = res.locals.returnTo || '/campgrounds'; 
        req.flash('success', 'Logged Out');
        res.redirect(redirectUrl);
    });
};
