const PDFDocument = require('pdfkit');
const moment = require('moment'); // For professional date formatting

async function convertSalaryJsonToPdf(employeeSalaryData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50 // Standard margins
        });

        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Assuming employeeSalaryData is an array and we take the first entry
        const employee = employeeSalaryData[0];

        // --- Document Header ---
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#333')
           .text('Salary Slip', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#555')
           .text('OraDigitals Pvt. Ltd.', { align: 'center' })
           .text('123 Digital Street, Tech City, Innovistan', { align: 'center' }) // Example company address
           .text('Phone: +123 456 7890 | Email: info@oradigitals.com', { align: 'center' })
           .moveDown(1);

        doc.strokeColor('#ccc')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke()
           .moveDown(1);

        // --- Employee Details Section ---
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#333')
           .text('Employee Details:', { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .font('Helvetica');

        const detailsX = 50;
        const detailsY = doc.y;
        const col2X = doc.page.width / 2;

        doc.text(`Employee Name:`, detailsX, detailsY);
        doc.text(`${employee.employee_name}`, col2X, detailsY);
        doc.moveDown(0.5);

        doc.text(`Employee ID:`, detailsX, doc.y);
        doc.text(`${employee.system_employee_id}`, col2X, doc.y); // Using system_employee_id
        doc.moveDown(0.5);

        doc.text(`Designation:`, detailsX, doc.y);
        doc.text(`${employee.designation || 'N/A'}`, col2X, doc.y);
        doc.moveDown(0.5);

        doc.text(`Salary Month:`, detailsX, doc.y);
        const salaryMonthName = moment().month(employee.salary_month - 1).format('MMMM'); // month is 0-indexed in moment
        doc.text(`${salaryMonthName} ${employee.salary_year}`, col2X, doc.y);
        doc.moveDown(0.5);

        doc.text(`Payment Date:`, detailsX, doc.y);
        doc.text(`${moment(employee.payment_date).format('DD-MM-YYYY')}`, col2X, doc.y);
        doc.moveDown(0.5);

        doc.text(`Payment Method:`, detailsX, doc.y);
        doc.text(`${employee.payment_method.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`, col2X, doc.y);
        doc.moveDown(0.5);

        if (employee.reference_number) {
            doc.text(`Reference No.:`, detailsX, doc.y);
            doc.text(`${employee.reference_number}`, col2X, doc.y);
            doc.moveDown(1);
        } else {
            doc.moveDown(0.5);
        }


        doc.strokeColor('#eee')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke()
           .moveDown(1);

        // --- Salary Details (Simplified) ---
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#333')
           .text('Salary Details:', { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .font('Helvetica');

        const salaryX = 50;
        const salaryValueX = doc.page.width - 150;

        const salaryAmount = parseFloat(employee.amount); // Ensure amount is treated as a number

        doc.text('Gross Salary:', salaryX, doc.y);
        doc.text(`$${salaryAmount.toFixed(2)}`, salaryValueX, doc.y, { align: 'right' });
        doc.moveDown(0.5);

        // If there are specific deductions or bonuses embedded in the notes,
        // you might want to parse them here, but for simplicity, we'll just show the total.
        if (employee.notes) {
            doc.text('Notes:', salaryX, doc.y);
            doc.text(`${employee.notes}`, salaryValueX, doc.y, { align: 'right' });
            doc.moveDown(0.5);
        }
        doc.moveDown(0.5);

        doc.strokeColor('#eee')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke()
           .moveDown(1);

        // --- Net Pay Section (which is the amount in this case) ---
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#006600') // Green for net pay
           .text('Net Pay (Take Home):', 50, doc.y);
        doc.text(`$${salaryAmount.toFixed(2)}`, doc.page.width - 150, doc.y, { align: 'right' });
        doc.moveDown(2);

        // --- Footer / Signature ---
        doc.fontSize(10)
           .font('Helvetica-Oblique')
           .fillColor('#888')
           .text('This is a computer-generated salary slip and does not require a signature.', { align: 'center' })
           .moveDown(0.5);

        doc.text(`Generated on: ${moment().format('DD-MM-YYYY HH:mm:ss')}`, { align: 'center' });

        doc.end();
    });
}

module.exports = convertSalaryJsonToPdf;