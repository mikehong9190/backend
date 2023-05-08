export const resetPasswordTemplate = (otp) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email for Swiirl</title>
        </head>
        <body>
            <div>Dear User,</div><br/>
            <div>We received a request to reset your Swiirl password. Please use the following One-Time Password (OTP) to verify your email and reset your password:</div>
            <h2>${otp}</h2><br/>
            <div>Please enter this code in the Swiirl app to complete the password reset process. Note that this code will expire in 10 minutes for security purposes. If you did not request this password reset, please ignore this message.<br/>
            <div>Thank you for choosing Swiirl!</div><br/>
            Best regards,<br/>
            The Swiirl Team
        </body>
      </html>
      `;
  };
  
  