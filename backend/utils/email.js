const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url = '') {
    this.to = user.email;
    this.url = url;
    this.from = `coHealth <${process.env.EMAIL_FROM}>`;
    this.username = user.fullname;
    this.password = user.password;
  }

  newTransport() {
    // Sendgrid
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../../frontend/template/email/${template}.pug`,
      {
        emailSubject: this.emailSubject,
        url: this.url,
        subject,
        password: this.password,
        username: this.username,
      }
    );
    // 2) Define email options
    let mailOptions = {
      from: `"coHealth " <${process.env.EMAIL_USER}>`,
      to: this.to, // Email người nhận
      subject: subject,
      html,
    };
    // console.log(this.to);

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendNewPassword() {
    this.emailSubject = 'Your password to coHealth account';
    await this.send('newPassword', `coHealth account's passoword`);
  }

  async sendPasswordReset() {
    this.emailSubject = 'Reset Password';
    await this.send(
      'passwordReset',
      'Reset password session will be expired in 10 minutes'
    );
  }
};
