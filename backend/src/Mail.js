var nodemailer = require('nodemailer');

class EmailSender{
    constructor() {
        this.transporter=nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'scrabble019@gmail.com',
            pass: '214r5tgru75'
            }
        });
    }

    async sendforgotpassword(receiveremail,receiverusername,receiverid,tokenurl){
        const email= {
            from: 'scrabble019@gmail.com',
            to: receiveremail,
            subject: "Scrabble 2 - Reset password",
            text: 'Hi '+receiverusername+', \nClick http://localhost:3000/forgotpassword/reset/' + receiverid+"/"+tokenurl + ' to reset your password. \n Yours sincerely, \n The scrabble team',
          }
        try{
        await this.transporter.sendMail(email)}catch(err){console.log("ERROR", err)}
    }
}

module.exports= new EmailSender()