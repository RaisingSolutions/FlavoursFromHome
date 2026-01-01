"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCouponEmail = exports.sendFeedbackRequestEmail = exports.sendOrderCancellationEmail = exports.sendOrderConfirmationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendOrderConfirmationEmail = async (to, orderDetails) => {
    try {
        const { orderId, firstName, items, total, address, orderType } = orderDetails;
        const addressLine = orderType === 'delivery' ? `<p><strong>Delivery Address:</strong> ${address}</p>` : '<p><strong>Collection:</strong> Contact Sivaji at 07507 000525</p>';
        await transporter.sendMail({
            from: '"Flavours From Home" <admin@flavours-from-home.co.uk>',
            to: to,
            subject: `Order #${orderId} Confirmed - Flavours From Home`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">✅ Order Confirmed!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for your order! We've received your payment and are preparing your items.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order #${orderId}</h2>
            <p><strong>Order Type:</strong> ${orderType === 'delivery' ? '🚚 Delivery' : '📦 Collection'}</p>
            ${addressLine}
            
            <h3>Items:</h3>
            <pre style="white-space: pre-wrap;">${items}</pre>
            
            <h3 style="margin-top: 20px;">Total: £${total.toFixed(2)}</h3>
            <p style="color: #2c5f2d;"><strong>Payment Status: PAID ✓</strong></p>
          </div>
          
          <p>If you have any questions, please contact us.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Flavours From Home Team</strong>
          </p>
        </div>
      `,
        });
        console.log('Order confirmation email sent to:', to);
    }
    catch (error) {
        console.error('Email send error:', error);
    }
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
const sendOrderCancellationEmail = async (to, orderDetails) => {
    try {
        const { orderId, firstName, totalAmount } = orderDetails;
        await transporter.sendMail({
            from: '"Flavours From Home" <admin@flavours-from-home.co.uk>',
            to: to,
            subject: `Order #${orderId} Cancelled - Flavours From Home`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">❌ Order Cancelled</h1>
          <p>Hi ${firstName},</p>
          <p>Your order #${orderId} has been cancelled.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">Refund Information</h3>
            <p>A full refund of <strong>£${totalAmount.toFixed(2)}</strong> has been initiated.</p>
            <p>The refund will appear in your account within 5-10 business days.</p>
          </div>
          
          <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Flavours From Home Team</strong>
          </p>
        </div>
      `,
        });
        console.log('Order cancellation email sent to:', to);
    }
    catch (error) {
        console.error('Email send error:', error);
    }
};
exports.sendOrderCancellationEmail = sendOrderCancellationEmail;
const sendFeedbackRequestEmail = async (to, orderDetails) => {
    try {
        const { orderId, firstName } = orderDetails;
        const feedbackUrl = `https://flavours-from-home.co.uk/feedback?order=${orderId}`;
        await transporter.sendMail({
            from: '"Flavours From Home" <admin@flavours-from-home.co.uk>',
            to: to,
            subject: `Order Delivered! Get £5 Off Your Next Order - Flavours From Home`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">✅ Order #${orderId} Delivered!</h1>
          <p>Hi ${firstName},</p>
          <p>We hope you enjoyed your order! Your feedback helps us serve you better.</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; color: white;">
            <h2 style="margin: 0 0 15px 0; font-size: 28px;">🎁 Get £5 Off!</h2>
            <p style="font-size: 18px; margin: 0 0 25px 0;">Share your feedback and receive a £5 voucher for your next order</p>
            <a href="${feedbackUrl}" style="display: inline-block; background: white; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              Leave Feedback Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This should only take 2 minutes. Rate your products, delivery, and driver to claim your voucher!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Flavours From Home Team</strong>
          </p>
        </div>
      `,
        });
        console.log('Feedback request email sent to:', to);
    }
    catch (error) {
        console.error('Email send error:', error);
    }
};
exports.sendFeedbackRequestEmail = sendFeedbackRequestEmail;
const sendCouponEmail = async (to, details) => {
    try {
        const { firstName, couponCode } = details;
        await transporter.sendMail({
            from: '"Flavours From Home" <admin@flavours-from-home.co.uk>',
            to: to,
            subject: `Your £5 Voucher Code - Flavours From Home`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">🎉 Thank You for Your Feedback!</h1>
          <p>Hi ${firstName},</p>
          <p>We really appreciate you taking the time to share your thoughts with us!</p>
          
          <div style="background: #f0f8ff; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 3px dashed #667eea;">
            <h2 style="margin: 0 0 15px 0; color: #667eea;">Your £5 Voucher Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #2c5f2d; margin: 20px 0;">
              ${couponCode}
            </div>
            <p style="color: #666; margin: 0;">Use this code at checkout on your next order!</p>
          </div>
          
          <p>This voucher gives you £5 off your next order. Simply enter the code at checkout.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Flavours From Home Team</strong>
          </p>
        </div>
      `,
        });
        console.log('Coupon email sent to:', to);
    }
    catch (error) {
        console.error('Email send error:', error);
    }
};
exports.sendCouponEmail = sendCouponEmail;
