import userModel from './../models/user.model';
import bcrypt from 'bcrypt';
import { notiRes } from './../langs/us/notification.us'

const AuthService = {};

AuthService.login = (name, email, pass, protocol, host) => {
  return new Promise(async (resolve, reject) => {
    let user = await userModel.findUserbyEmail(email);
    if (!user)
      return reject (notiRes.invalidlUser);
    else {
      if (user.deletedAt != null)
        return reject(notiRes.blockUser);
      if (!user.local.isActived)
        return reject(notiRes.activeUser);
    }
    console.log(user)
    bcrypt.compare(pass, user.password, (err, result) => {
      if (err) {
        return reject (notiRes.invalidlUser);
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id
          },
          process.env.JWT_KEY,
          {
            expiresIn: "1h"
          }
        );
        return res.status(200).json({
          message: successUser,
          token: token
        });
      }
      return reject (notiRes.invalidlUser);
    });
  })
}

export default AuthService;