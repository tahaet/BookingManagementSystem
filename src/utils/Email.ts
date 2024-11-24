import nodemailer from 'nodemailer';
import { IUser } from '../models/userModel';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

export default class Email {
  private _to: string;
  private _firstName: string;
  private _url: string;
  private _from: string;
  constructor(user: IUser, url: string) {
    this._to = user.email;
    this._firstName = user.name.split(' ')[0];
    this._url = url;
    this._from = `Taha Tohami <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || '',
      //type casting here is a must
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this._firstName,
      url: this._url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this._from,
      to: this._to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}
