import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { IBooking, ITrip } from '@interface/booking/booking';

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

  async sendBookingDetails(tripData: ITrip, bookingData: IBooking) {
    console.log(tripData)
    console.log(bookingData)
    try {
      // Format dates
      const startDate = new Date(tripData?.start_date).toLocaleDateString();
      const startTime = new Date(tripData?.start_date).toLocaleTimeString();

      // Create booking reference ID (using booking_id or a combination of IDs)
      const bookingReference =  bookingData.booking_id ? `${bookingData.booking_id?.toString()?.padStart(6, '0')}` : "BK123";

      // Format card number to show only last 4 digits
      const maskedCardNumber = bookingData.card_number
        ? `**** **** **** ${bookingData.card_number.slice(-4)}`
        : 'N/A';

      // Format seats as comma-separated list
      const seatsFormatted = bookingData.seats.join(', ');

      // Create email content
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: bookingData.email,
        subject: 'Bus Buddy Booking Confirmation: Your Trip Details',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Bus Buddy - Booking Confirmation</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .header {
                background-color: #4A90E2;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .content {
                padding: 20px;
              }
              .booking-details, .payment-details, .trip-details {
                margin-bottom: 25px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              .footer {
                background-color: #f2f2f2;
                padding: 15px;
                text-align: center;
                font-size: 12px;
              }
              .special-note {
                background-color: #f9f9f9;
                padding: 15px;
                border-left: 3px solid #4A90E2;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Booking Reference: ${bookingReference}</p>
            </div>
            
            <div class="content">
              <p>Dear ${bookingData?.passenger_name},</p>
              
              <p>Thank you for choosing our service. Your booking has been confirmed! Below are the details of your trip:</p>
              
              <div class="trip-details">
                <h2>Trip Information</h2>
                <table>
                  <tr>
                    <th>From</th>
                    <td>${tripData.start_location ?? "location"}</td>
                  </tr>
                  <tr>
                    <th>To</th>
                    <td>${tripData.destination ?? "destination"}</td>
                  </tr>
                  <tr>
                    <th>Date</th>
                    <td>${startDate}</td>
                  </tr>
                  <tr>
                    <th>Time</th>
                    <td>${startTime}</td>
                  </tr>
                  <tr>
                    <th>Bus Number</th>
                    <td>${tripData.bus_number ?? "bus number"}</td>
                  </tr>
                </table>
              </div>
              
              <div class="booking-details">
                <h2>Booking Details</h2>
                <table>
                  <tr>
                    <th>Passenger Name</th>
                    <td>${bookingData.passenger_name ?? "name"}</td>
                  </tr>
                  <tr>
                    <th>NIC</th>
                    <td>${bookingData.nic}</td>
                  </tr>
                  <tr>
                    <th>Seat Number(s)</th>
                    <td>${seatsFormatted}</td>
                  </tr>
                  <tr>
                    <th>Pick-up Location</th>
                    <td>${bookingData.pick_up_location}</td>
                  </tr>
                  <tr>
                    <th>Drop Location</th>
                    <td>${bookingData.drop_location}</td>
                  </tr>
                  <tr>
                    <th>Contact Number</th>
                    <td>${bookingData.contact_no}</td>
                  </tr>
                  <tr>
                    <th>Emergency Contact</th>
                    <td>${bookingData.guardian_contact}</td>
                  </tr>
                </table>
              </div>
              
              <div class="payment-details">
                <h2>Payment Information</h2>
                <table>
                  <tr>
                    <th>Card Holder</th>
                    <td>${bookingData.card_holder_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Card Number</th>
                    <td>${maskedCardNumber}</td>
                  </tr>
                </table>
              </div>
              
              ${
                bookingData.special_instruction
                  ? `
              <div class="special-note">
                <h3>Special Instructions</h3>
                <p>${bookingData.special_instruction}</p>
              </div>
              `
                  : ''
              }
              
              <p>Please arrive at least 30 minutes before departure. Keep this email as your booking confirmation.</p>
              
              <p>If you have any questions or need to make changes to your booking, please contact our customer service at <a href="mailto:support@example.com">support@example.com</a> or call us at +1-234-567-8900.</p>
              
              <p>We wish you a pleasant journey!</p>
              
              <p>Best regards,<br>Bus Buddy Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 Bus Buddy. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </body>
          </html>
        `,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Booking confirmation email sent to ${bookingData.email}: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation email: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async sendCancelEmail(bookingData: IBooking) {
    try {
      const subject = 'Booking Cancellation Confirmation';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4A90E2;
              color: white;
              text-align: center;
              padding: 20px;
              border-bottom: 3px solid #0066cc;
            }
            .content {
              padding: 20px;
            }
            .booking-details {
              background-color: #f8f9fa;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
            }
            .booking-item {
              margin-bottom: 10px;
            }
            .booking-label {
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666666;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
            }
            .btn {
              display: inline-block;
              background-color: #0066cc;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancellation Confirmation</h1>
            </div>
            
            <div class="content">
              <p>Dear ${bookingData.passenger_name},</p>
              
              <p>This email confirms that your booking <strong>#${bookingData.booking_id}</strong> has been successfully cancelled as requested.</p>
              
              <div class="booking-details">
                <h3>Cancelled Booking Details:</h3>
                
                <div class="booking-item">
                  <span class="booking-label">Booking ID:</span> ${bookingData.booking_id}
                </div>
                
                <div class="booking-item">
                  <span class="booking-label">Passenger:</span> ${bookingData.passenger_name}
                </div>
                
                <div class="booking-item">
                  <span class="booking-label">NIC:</span> ${bookingData.nic}
                </div>
                
                <div class="booking-item">
                  <span class="booking-label">Pick-up Location:</span> ${bookingData.pick_up_location}
                </div>
                
                <div class="booking-item">
                  <span class="booking-label">Drop Location:</span> ${bookingData.drop_location}
                </div>
                
                <div class="booking-item">
                  <span class="booking-label">Seat Number(s):</span> ${bookingData.seats.join(', ')}
                </div>
                
                ${bookingData.total_amount ? `
                  <div class="booking-item">
                    <span class="booking-label">Amount Paid:</span> ${bookingData.total_amount}
                  </div>
                ` : ''}
              </div>
              
              <p><strong>Refund Information:</strong></p>
              <p>If eligible, a refund will be processed to your original payment method within 5-7 business days.</p>
              
              <p>If you have any questions or require further assistance, please don't hesitate to contact our customer service team at support@example.com or call us at +1-800-123-4567.</p>
              
              <p>Thank you for using our services.</p>
              
              <p>Sincerely,<br>
              Bus Buddy Team</p>
              
              <a href="https://example.com/bookings" class="btn">View Booking History</a>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Bus Buddy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Create mail options
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: bookingData.email,
        subject: subject,
        html: htmlContent,
      };
      
      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(
        `Cancellation email sent to ${bookingData.email} for booking ${bookingData.booking_id}: ${info.messageId}`
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send cancellation email: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}
