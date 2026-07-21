import { Resend } from 'resend';
import { config } from 'dotenv';

config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email
 * @param email - Recipient email
 * @param token - Verification token
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] Verification email sent to: ${email}`);
    console.log(`[EMAIL] Verification link: http://localhost:3000/verify/${token}`);
    return {
      success: true,
      messageId: 'dev-mock-message-id'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your email for OrderXpress',
      html: `<p>Click <a href="${process.env.CLIENT_URL}/verify/${token}">here</a> to verify your email.</p>`,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param email - Recipient email
 * @param token - Reset token
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] Password reset email sent to: ${email}`);
    console.log(`[EMAIL] Reset link: http://localhost:3000/reset-password/${token}`);
    return {
      success: true,
      messageId: 'dev-mock-message-id'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your password for OrderXpress',
      html: `<p>Click <a href="${process.env.CLIENT_URL}/reset-password/${token}">here</a> to reset your password.</p>`,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send order confirmation email
 * @param email - Recipient email
 * @param orderDetails - Order information
 */
export const sendOrderConfirmationEmail = async (email: string, orderDetails: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] Order confirmation sent to: ${email}`);
    console.log(`[EMAIL] Order ID: ${orderDetails._id || 'N/A'}`);
    return { success: true, messageId: 'dev-mock-message-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Order Confirmation - OrderXpress',
      html: `
        <h1>Thank you for your order!</h1>
        <p>Order ID: ${orderDetails._id}</p>
        <p>Total: $${orderDetails.total}</p>
        <p>We'll notify you when your order is ready.</p>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Error sending order confirmation email:', err);
    throw new Error('Failed to send order confirmation email');
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail
};