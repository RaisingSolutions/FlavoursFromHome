import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = async (
  to: string,
  orderDetails: {
    orderId: number;
    firstName: string;
    items: string;
    total: number;
    address: string;
    orderType: string;
  }
) => {
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
  } catch (error) {
    console.error('Email send error:', error);
  }
};

export const sendOrderCancellationEmail = async (
  to: string,
  orderDetails: {
    orderId: number;
    firstName: string;
    totalAmount: number;
  }
) => {
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
  } catch (error) {
    console.error('Email send error:', error);
  }
};
