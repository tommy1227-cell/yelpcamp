const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
// passport-local-mongooseはusername password saltが自動で入っている
const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique:true
        }
    }
);

// plugin 差し込み
userSchema.plugin(passportLocalMongoose,{
    errorMessages:{
        UserExistsError:'そのユーザー名は既に使われています'
    }
});

module.exports =mongoose.model('User',userSchema);