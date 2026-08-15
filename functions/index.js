const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const logger = require('firebase-functions/logger')
const sgMail = require('@sendgrid/mail')

const sendgridApiKey = defineSecret('SENDGRID_API_KEY')

const FROM_EMAIL = 'webapp@santicafe.ca'
const TO_EMAIL = 'orders@santicafe.ca'

exports.sendOrderEmail = onCall(
  { secrets: [sendgridApiKey] },
  async (request) => {
    const { order } = request.data

    if (!order || !order.items || !order.customer) {
      throw new HttpsError('invalid-argument', 'Missing order data')
    }

    sgMail.setApiKey(sendgridApiKey.value())

    // Build items rows for the email
    const itemRows = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc;">${item.emoji} ${item.name}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc; text-align: center;">×${item.quantity}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2d0bc; text-align: right;">$${item.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join('')

    const html = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #4a2a0a;">
        <div style="background: #4a2a0a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #f2ebe0; margin: 0; font-size: 22px;">☕ New Order — Santi Café</h1>
        </div>

        <div style="background: #faf5ee; padding: 24px 32px; border: 1px solid #e2d0bc; border-top: none;">
          ${order.orderNumber ? `<p style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #7b4a1e;">Order #${order.orderNumber}</p>` : ''}
          <h2 style="margin: 0 0 4px; font-size: 16px; color: #7b4a1e;">Customer</h2>
          <p style="margin: 0 0 20px; color: #7b5535;">
            <strong>${order.customer.name}</strong><br/>
            ${order.customer.phone}
          </p>

          <h2 style="margin: 0 0 12px; font-size: 16px; color: #7b4a1e;">Order</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="font-size: 12px; text-transform: uppercase; color: #b8956a; letter-spacing: 0.05em;">
                <th style="text-align: left; padding-bottom: 8px;">Item</th>
                <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Subtotal</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #7b5535;">Tax (8%)</td>
              <td style="padding: 4px 0; text-align: right; color: #7b5535;">$${order.tax.toFixed(2)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 16px;">
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; color: #4a2a0a;">Total</td>
              <td style="padding: 12px 0 4px; border-top: 2px solid #e2d0bc; text-align: right; color: #7b4a1e;">$${order.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f2ebe0; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2d0bc; border-top: none; font-size: 12px; color: #b8956a; text-align: center;">
          Santi Café · Order notification
        </div>
      </div>
    `

    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `Order #${order.orderNumber || '—'} from ${order.customer.name} — $${order.grandTotal.toFixed(2)}`,
      html,
    }

    try {
      logger.info('Sending order email to', TO_EMAIL)
      await sgMail.send(msg)
      logger.info('Order email sent successfully')
      return { success: true }
    } catch (err) {
      logger.error('SendGrid error', { body: err?.response?.body || err.message })
      throw new HttpsError('internal', 'Failed to send email')
    }
  }
)
