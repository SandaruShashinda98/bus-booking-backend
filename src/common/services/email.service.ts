import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Initialize the nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send an onboarding email to a newly created user
   * @param userEmail The email of the user
   * @param tempPassword The temporary password generated for the user
   * @param resetToken The token for password reset
   */
  async sendOnboardingEmail(
    userEmail: string,
    tempPassword: string,
    resetToken: string,
    resetMethod: string,
  ): Promise<boolean> {
    try {
      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:3000',
      );
      const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}&resetMethod=${resetMethod}`;

      const mailOptions = {
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'System Admin')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: userEmail,
        subject: 'Welcome to RingHD - Your Account Details',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to RingHD!</h2>
            <p>Your account has been created successfully. Please find your login details below:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            
            <p>For security reasons, please reset your password by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            
            <p>This link will expire in 24 hours for security reasons.</p>
            
            <p>If you did not request this account, please ignore this email or contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Onboarding email sent to ${userEmail}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send onboarding email to ${userEmail}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send a password reset email to a user
   * @param userEmail The email of the user
   * @param resetToken The token for password reset
   */
  async sendResetPasswordEmail(
    userEmail: string,
    resetToken: string,
    resetMethod: string,
  ): Promise<boolean> {
    try {
      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:3000',
      );
      const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}&resetMethod=${resetMethod}`;

      const mailOptions = {
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'System Admin')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: userEmail,
        subject: 'Reset Your RingHD Password',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for your RingHD account.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>
          
          <p>To set a new password, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>If you did not request a password reset, please ignore this email or contact our support team immediately as your account may be at risk.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Password reset email sent to ${userEmail}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${userEmail}:`,
        error,
      );
      return false;
    }
  }
}
