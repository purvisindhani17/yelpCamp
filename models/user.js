
const mongoose=require('mongoose');
const schema=mongoose.Schema;
const plm=require('passport-local-mongoose');

const userSchema=new schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})
userSchema.plugin(plm.default);

module.exports=mongoose.model('User',userSchema);