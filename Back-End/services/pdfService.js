import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a PDF quotation for an order
 * @param {Object} order - Populated order with customer, items.product, packages.package
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateQuotationPDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Company details
            const companyName = 'Wemax Tech';
            const companyPhone = process.env.COMPANY_PHONE || '+254 700 000 000';
            const companyEmail = process.env.COMPANY_EMAIL || 'info@wemaxtech.com';
            const companyWebsite = process.env.COMPANY_WEBSITE || 'www.wemaxtech.com';
            const paybillNumber = process.env.BANK_PAYBILL_NUMBER || '123456';
            const accountNumber = process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001';

            // Try to include the dark theme Wemax logo from the Front-End assets
            // Default path assumes monorepo layout: /Front-End/src/assets/wemax-logo.jpg
            let headerStartY = 50;
            try {
                const logoPath = path.resolve(__dirname, '..', '..', 'Front-End', 'src', 'assets', 'wemax-logo.jpg');
                if (fs.existsSync(logoPath)) {
                    // Draw logo on the left
                    doc.image(logoPath, 50, 40, { width: 70 });
                    headerStartY = 120; // Push text below the logo
                }
            } catch (e) {
                // If logo not found, continue without failing
                console.warn('[PDF] Wemax logo not found or failed to load:', e?.message || e);
            }

            // Header text
            doc.fontSize(24).font('Helvetica-Bold').text(companyName, 50, headerStartY, { align: 'left' });
            doc.fontSize(10).font('Helvetica').text('Smart Tech. Smart Living.', 50, headerStartY + 25, { align: 'left' });

            // Company contact info (right side)
            doc.fontSize(9).font('Helvetica').text(`Phone: ${companyPhone}`, 400, headerStartY, { align: 'right' });
            doc.text(`Email: ${companyEmail}`, 400, headerStartY + 15, { align: 'right' });
            doc.text(`Website: ${companyWebsite}`, 400, headerStartY + 30, { align: 'right' });

            // Quotation details
            const quotationNumber = `QT-${String(order._id).slice(-8).toUpperCase()}`;
            const dateIssued = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const validDate = new Date(order.createdAt);
            validDate.setHours(validDate.getHours() + 48);
            const validUntil = validDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            let yPos = headerStartY + 70;

            doc.fontSize(16).font('Helvetica-Bold').text('QUOTATION', 50, yPos);
            yPos += 25;

            doc.fontSize(10).font('Helvetica');
            doc.text(`Quotation Number: ${quotationNumber}`, 50, yPos);
            yPos += 15;
            doc.text(`Date Issued: ${dateIssued}`, 50, yPos);
            yPos += 15;
            doc.text(`Valid Until: ${validUntil}`, 50, yPos);
            yPos += 25;

            // Customer details
            doc.fontSize(12).font('Helvetica-Bold').text('Customer Details', 50, yPos);
            yPos += 20;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${order.customer?.name || order.shippingAddress?.name || 'N/A'}`, 50, yPos);
            yPos += 15;
            doc.text(`Phone: ${order.customer?.phone || order.shippingAddress?.phone || 'N/A'}`, 50, yPos);
            yPos += 15;
            if (order.customer?.email) {
                doc.text(`Email: ${order.customer.email}`, 50, yPos);
                yPos += 15;
            }
            if (order.shippingAddress?.addressLine) {
                doc.text(`Address: ${order.shippingAddress.addressLine}`, 50, yPos);
                yPos += 15;
            }
            if (order.shippingAddress?.city) {
                doc.text(`City: ${order.shippingAddress.city}`, 50, yPos);
                yPos += 15;
            }
            yPos += 10;

            // Products table header
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Item', 50, yPos);
            doc.text('Quantity', 200, yPos);
            doc.text('Unit Price', 320, yPos);
            doc.text('Total', 450, yPos, { align: 'right' });
            yPos += 20;

            // Draw line
            doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
            yPos += 10;

            // Products
            doc.fontSize(10).font('Helvetica');
            for (const item of order.items || []) {
                const productName = item.product?.name || 'Product';
                const quantity = item.quantity || 1;
                const unitPrice = item.price || 0;
                const total = unitPrice * quantity;

                doc.text(productName, 50, yPos, { width: 140 });
                doc.text(String(quantity), 200, yPos);
                doc.text(`KES ${unitPrice.toLocaleString()}`, 320, yPos);
                doc.text(`KES ${total.toLocaleString()}`, 450, yPos, { align: 'right' });
                yPos += 20;

                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }
            }

            // Packages
            for (const pkg of order.packages || []) {
                const packageName = pkg.package?.name || 'Package';
                const quantity = pkg.quantity || 1;
                const unitPrice = pkg.price || 0;
                const total = unitPrice * quantity;

                doc.text(packageName, 50, yPos, { width: 140 });
                doc.text(String(quantity), 200, yPos);
                doc.text(`KES ${unitPrice.toLocaleString()}`, 320, yPos);
                doc.text(`KES ${total.toLocaleString()}`, 450, yPos, { align: 'right' });
                yPos += 20;

                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }
            }

            yPos += 10;
            doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
            yPos += 20;

            // Financial summary
            doc.fontSize(11).font('Helvetica-Bold').text('Financial Summary', 50, yPos);
            yPos += 20;
            doc.fontSize(10).font('Helvetica');
            doc.text('Subtotal:', 350, yPos);
            doc.text(`KES ${(order.subtotal || 0).toLocaleString()}`, 450, yPos, { align: 'right' });
            yPos += 15;
            doc.text('Shipping:', 350, yPos);
            doc.text(`KES ${(order.shippingCost || 0).toLocaleString()}`, 450, yPos, { align: 'right' });
            yPos += 20;
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Total Amount:', 350, yPos);
            doc.text(`KES ${(order.total || 0).toLocaleString()}`, 450, yPos, { align: 'right' });
            yPos += 30;

            // Payment instructions
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Instructions', 50, yPos);
            yPos += 20;
            doc.fontSize(10).font('Helvetica');
            doc.text(`1. Go to M-Pesa menu on your phone`, 50, yPos);
            yPos += 15;
            doc.text(`2. Select "Pay Bill"`, 50, yPos);
            yPos += 15;
            doc.text(`3. Enter Paybill Number: ${paybillNumber}`, 50, yPos);
            yPos += 15;
            doc.text(`4. Enter Account Number: ${accountNumber}`, 50, yPos);
            yPos += 15;
            doc.text(`5. Enter Amount: KES ${(order.total || 0).toLocaleString()}`, 50, yPos);
            yPos += 15;
            doc.text(`6. Enter your M-Pesa PIN and confirm`, 50, yPos);
            yPos += 25;

            // Payment terms
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Terms', 50, yPos);
            yPos += 20;
            doc.fontSize(10).font('Helvetica');
            doc.text(`• This quotation is valid for 48 hours from the date of issue.`, 50, yPos, { width: 500 });
            yPos += 15;
            doc.text(`• Payment must be completed within the validity period to secure your order.`, 50, yPos, { width: 500 });
            yPos += 15;
            doc.text(`• After payment, please upload proof of payment or contact us for confirmation.`, 50, yPos, { width: 500 });
            yPos += 15;
            doc.text(`• Once payment is confirmed, your order will be processed and shipped.`, 50, yPos, { width: 500 });
            yPos += 15;
            doc.text(`• For any inquiries, contact us at ${companyPhone} or ${companyEmail}.`, 50, yPos, { width: 500 });
            yPos += 30;

            // Footer
            doc.fontSize(9).font('Helvetica').fillColor('gray');
            doc.text(`Thank you for choosing ${companyName}!`, 50, yPos, { align: 'center' });
            yPos += 10;
            doc.text('Smart Tech. Smart Living.', 50, yPos, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}
