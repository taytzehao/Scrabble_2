const crypto = require('crypto');
const bcrypt = require('bcrypt')

const ResetTokenModel = require('../Model/ResetTokenModel.js');
const UserModel = require('../Model/AccountInfoModel.js');
class MongooseService{
    static async createPasswordResetToken(userId) {
        // throw new Error('Not implemented');
        const passwordReset = new ResetTokenModel({userId:userId});
        //passwordReset.userId = userId;
        const savedToken = await passwordReset.save();
        return savedToken.token;
      }

    static async findByEmail(email) {
        
        const user=await UserModel.findOne( {email:email} )
        return user;
      }

    static async verifyPasswordResetToken(userId, token) {
    // throw new Error('Not implemented');
    return ResetTokenModel.findOne({token,userId,}).exec();
    }

    static async changePassword(userid, password) {
        // throw new Error('Not implemented');
        const hashed_password=await bcrypt.hash(password,10)

        const user = await UserModel.updateOne({_id:userid},{password:hashed_password});
        if (!user) {
          throw new Error('User not found');
        }
      }

    static async deletePasswordResetToken(token) {
        // throw new Error('Not implemented');
        return ResetTokenModel.findOneAndDelete({
          token,
        }).exec();
      }
}

module.exports = {
    DataService:MongooseService
}
