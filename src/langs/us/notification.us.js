/**
 * define all constants for US locations
 */
const registerError = {
    username: "Username limited from 1-30 characters and does not contain special characters",
    email: "Email must be in format example@gmail.com!",
    password: "Password must contain at least 8 characters including uppercase, lowercase letters, numbers and special characters",
    confirmPassword: "The password does not match",
}
const notificationRegister = {
    blockUser: "This account has been blocked",
    emailUser:"This email is already registered",
    activeUser:"This account has not been activated",
    successUser:"Account registration is successful",
    registerSuccess: (email) => {
        return `Account <strong>${email}</strong> is registered successfully, please check email before login.`
    },
    sendFail: "There was an error in sending email, please register your account again"
}
const translateMail ={
    subject : '"SOAS" Verify account registration',
    content : (link)=>{
        return `<h2> Welcome to SOAS! </h2>
                <h3> Thank you for creating an account to join Secure Onine Auction ystem </h3>
                <h3> Click the link below to activate your account on the system <strong>SOAS</strong> </h3>
                <h3><a href="${link}" target="blank">${link}</a></h3>`
    },
    sendFail: "There was an error in sending email, please register your account again",
    isToken:'Token does not exist. Account has been activated!',
    activeSuccess : "Account is activated successfully. Please login to use the service."
}
const loginError = {
    duplicationEmail:(email)=> `Account <strong> ${email} </strong> has been registered, please register another email`,
    deletedAcc:(email)=> `The account <strong> ${email} </strong> has been disabled, please contact the Admin to get your account back.`,
    activeAcc:(email) => `This account has been registered but not active yet, please email <strong> ${email} </strong> to activate your account.`,
    loginFail:'The account or password is incorrect.',
    loginActiveAcc:"The account is not active, please check your email and active account.",
    serverLogin: "An error has occurred in the login system, please login again.",
}
const loginSuccess = {
    loginSuccess: "The account is logged in successfully.",
    logoutSuccess: "The account is logged out successfully.",
}

export const regisErr = registerError;
export const notiRes = notificationRegister;
export const transMail = translateMail;
export const loginErr = loginError;
export const loginSucc = loginSuccess;