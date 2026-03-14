const express=require('express');
const router=express.Router({mergeParams:true});
const users=require('../controllers/users');
const passport=require('passport');
const {isloggedin}=require('../logged')
const asyncf=require('../utility/async');
const { storeReturnTo } = require('../logged');
router.route('/register')
    .get(users.regUser)
    .post(asyncf(users.register))
router.route('/login')
    .get(users.Rendlogin)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),asyncf(users.login));
router.get('/logout', storeReturnTo,users.logout); 



module.exports=router;