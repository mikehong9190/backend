export const verifyEmailTemplate = (otp) => {
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
            <div>Thank you for signing up for Swiirl! To complete the registration process, we need to verify your email address.</div><br/>
            <div>Please use the following One-Time Password (OTP) to verify your email:</div>
            <h2>${otp}</h2><br/>
            <div>Please enter this code in the Swiirl app to complete the verification process. Note that this code will expire in 10 minutes for security purposes. If you did not request this verification, please ignore this message.</div><br/>
            Thank you for choosing Swiirl!<br/>
            Best regards,<br/>
            The Swiirl Team
        </body>
      </html>
      `;
  };
  
  