const PDFDocument = require('pdfkit');

exports.generatePdfFromJson = (data,Title,Author) => {
  const months =[
    "none",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ]
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Draw a border on the current page
      const drawBorder = () => {
        const { width, height, margins } = doc.page;
        doc
          .save()
          .lineWidth(1)
          .strokeColor('#000')
          // x, y, w, h
          .rect(
            margins.left / 2,
            margins.top / 2,
            width - margins.left,
            height - margins.top
          )
          .stroke()
          .restore();
      };

      // Draw border on first page...
      doc.on('pageAdded', drawBorder);
      drawBorder();

      // Collect PDF chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Metadata
      doc.info.Title = Title;
      doc.info.Author = Author;

      // Title
      doc
        .fontSize(20)
        .fillColor('#333')
        .text('OraDigitals Monthly Expense Report', { align: 'center', underline: true });
      doc.moveDown(2);

      // Table headers
      const tableTop = doc.y;
      const rowHeight = 25;
      const col1 = 50, col2 = 200, col3 = 400;

      doc
        .fontSize(12)
        .fillColor('white')
        .rect(col1 - 5, tableTop - 5, 500, rowHeight)
        .fill('#4a90e2')
        .fillColor('white')
        .text('Year', col1, tableTop)
        .text('Month', col2, tableTop)
        .text('Amount (PKR)', col3, tableTop);
      doc.moveDown();

      // Table rows
      let y = tableTop + rowHeight;
      data.forEach((item, index) => {
        const isEven = index % 2 === 0;
        doc
          .fillColor(isEven ? '#f2f2f2' : '#ffffff')
          .rect(col1 - 5, y - 5, 500, rowHeight)
          .fill();

        doc
          .fillColor('#000')
          .fontSize(11)
          .text(item.expense_year.toString(), col1, y)
          .text(months[item.expense_month], col2, y)
          .text(parseFloat(item.total_expense_amount || 0).toFixed(2), col3, y);

        y += rowHeight;
        // start new page if beyond bottom margin
        if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.y;
        }
      });

      doc.moveDown(2);
      doc
        .fontSize(10)
        .fillColor('gray')
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: 'right',
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
