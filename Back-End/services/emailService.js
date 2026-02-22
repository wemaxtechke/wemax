import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
function createTransporter() {
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || 587;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
        console.warn('[Email] EMAIL_USER or EMAIL_PASSWORD not set - email service disabled');
        return null;
    }

    return nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
    });
}

/**
 * Send quotation PDF via email
 * @param {string} to - Recipient email
 * @param {string} customerName - Customer name
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} orderId - Order ID
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendQuotationEmail(to, customerName, pdfBuffer, orderId) {
    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }

    const quotationNumber = `QT-${String(orderId).slice(-8).toUpperCase()}`;
    const companyName = process.env.COMPANY_NAME || 'Wemax Tech';
    const companyEmail = process.env.COMPANY_EMAIL || 'info@wemaxtech.com';

    try {
        await transporter.sendMail({
            from: `"${companyName}" <${companyEmail}>`,
            to,
            subject: `Your Quotation - ${quotationNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Thank you for your order, ${customerName}!</h2>
                    <p>We have received your order and attached your quotation below.</p>
                    <p><strong>Quotation Number:</strong> ${quotationNumber}</p>
                    <p>Please review the quotation and complete payment within 48 hours to secure your order.</p>
                    <p>If you have any questions, feel free to contact us.</p>
                    <br>
                    <p>Best regards,<br><strong>${companyName}</strong><br>Smart Tech. Smart Living.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `quotation-${quotationNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        console.log('[Email] Quotation sent to', to);
        return { success: true };
    } catch (error) {
        console.error('[Email] Failed to send quotation:', error.message);
        return { success: false, error: error.message };
    }
}
