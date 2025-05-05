import { GetVerificationEmailContentFn, GetPasswordResetEmailContentFn } from 'wasp/server/auth';

export const getVerificationEmailContent: GetVerificationEmailContentFn = ({
  verificationLink
}) => ({
  subject: 'Verify your Thesis Grey account',
  text: `Welcome to Thesis Grey! Please verify your email by clicking the following link: ${verificationLink}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Thesis Grey</h2>
      <p>Thank you for creating an account. To complete your registration, please verify your email address by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
      </p>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
  `
});

export const getPasswordResetEmailContent: GetPasswordResetEmailContentFn = ({
  passwordResetLink
}) => ({
  subject: 'Reset your Thesis Grey password',
  text: `You requested to reset your Thesis Grey password. Please click the following link to reset it: ${passwordResetLink}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>We received a request to reset your password for Thesis Grey. To proceed with resetting your password, please click the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${passwordResetLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Thank you,<br>The Thesis Grey Team</p>
    </div>
  `
}); 