const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Saurav Mishra <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendinBlue
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: 'sauravmishra184@gmail.com',
          pass: 'YWrqAFIJVOEjLh6a',
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,

      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate in GMAIL less secure option
    });
  }
  async send(template, subject) {
    //Send the actual email
    //1) render the HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    //3)create a Transport and await
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Bengal Splendors!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token(valid only for 10 minutes)'
    );
  }
};
