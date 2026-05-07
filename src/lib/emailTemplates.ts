export const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@800&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      color: #ffffff;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #000;
    }
    
    .header {
      padding-bottom: 40px;
      text-align: center;
      border-bottom: 1px solid #1a1a1a;
    }
    
    .logo {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #ccff00;
      letter-spacing: -2px;
      text-transform: uppercase;
      text-decoration: none;
    }
    
    .content {
      padding: 40px 0;
    }
    
    .h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: -1px;
      line-height: 1.2;
    }
    
    .p {
      font-size: 16px;
      line-height: 1.6;
      color: #a0a0a0;
      margin-bottom: 24px;
    }
    
    .button-container {
      margin: 40px 0;
      text-align: center;
    }
    
    .button {
      display: inline-block;
      background-color: #ccff00;
      color: #000000;
      padding: 18px 36px;
      font-size: 14px;
      font-weight: 800;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .footer {
      padding-top: 40px;
      border-top: 1px solid #1a1a1a;
      font-size: 12px;
      color: #404040;
      text-align: center;
    }
    
    .footer-links {
      margin-bottom: 20px;
    }
    
    .footer-link {
      color: #606060;
      text-decoration: none;
      margin: 0 10px;
    }
    
    .security-note {
      padding: 20px;
      background-color: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      font-size: 13px;
      color: #606060;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://gatimusic.in" class="logo">GATI.</a>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="security-note">
      <strong>Security Messaging:</strong> This is a secure automated message. Our team will never ask for your password via email. If you did not expect this email, please secure your account immediately.
    </div>
    
    <div class="footer">
      <div class="footer-links">
        <a href="https://gatimusic.in/terms" class="footer-link">Terms</a>
        <a href="https://gatimusic.in/privacy" class="footer-link">Privacy</a>
        <a href="https://gatimusic.in/support" class="footer-link">Support</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Gati Music Distribution. All rights reserved.</p>
      <p>123 Music Lane, Audio City | support@gatimusic.in</p>
    </div>
  </div>
</body>
</html>
`;

export const getVerificationTemplate = (name: string, url: string) => getBaseTemplate(`
  <h1 class="h1">Verify Your Artist Account</h1>
  <p class="p">Hi ${name},</p>
  <p class="p">Welcome to the future of music distribution. To begin your journey and start releasing tracks worldwide, please verify your email address by clicking the button below.</p>
  
  <div class="button-container">
    <a href="${url}" class="button">Verify Email Address</a>
  </div>
  
  <p class="p">If the button doesn't work, you can copy and paste this link into your browser:</p>
  <p class="p" style="word-break: break-all; font-size: 13px; color: #ccff00;">${url}</p>
`);

export const getPasswordResetTemplate = (name: string, url: string) => getBaseTemplate(`
  <h1 class="h1">Reset Your Password</h1>
  <p class="p">Hi ${name},</p>
  <p class="p">We received a request to reset the password for your Gati Music account. If you made this request, click the button below to set a new password.</p>
  
  <div class="button-container">
    <a href="${url}" class="button">Reset Password</a>
  </div>
  
  <p class="p">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  
  <p class="p">The link will expire in 1 hour for your security.</p>
`);

export const getWelcomeTemplate = (name: string) => getBaseTemplate(`
  <h1 class="h1">Artist Account Approved 🚀</h1>
  <p class="p">Hi ${name},</p>
  <p class="p">Your application to Gati Music Distribution has been approved! You now have full access to our distribution platform.</p>
  
  <p class="p">Get ready to:</p>
  <ul class="p" style="padding-left: 20px;">
    <li>Distribute to Spotify, Apple Music & more.</li>
    <li>Keep 100% of your rights.</li>
    <li>Track detailed analytics.</li>
  </ul>
  
  <div class="button-container">
    <a href="https://gatimusic.in/dashboard" class="button">Go To Dashboard</a>
  </div>
  
  <p class="p">We can't wait to hear what you've been working on.</p>
`);
