const PDFDocument = require("pdfkit");
const fs = require("fs");

/**
 * Converts JSON data into a PDF document with a table format.
 * This version uses a direct coordinate-based approach for table rendering
 * to ensure precise alignment and prevent column overlapping.
 *
 * @param {Array<Object>} data - The JSON data (array of objects) to be included in the PDF.
 * @param {string} [outputPath=null] - Optional. The file path to save the PDF. If null, a Buffer is returned.
 * @param {string} [Title="Payment Summary"] - Optional. The title for the PDF metadata.
 * @param {string} [Author="Oradigitals"] - Optional. The author for the PDF metadata.
 * @returns {Promise<Buffer|string>} A Promise that resolves with the PDF Buffer if outputPath is null,
 * or a success message string if outputPath is provided.
 */
const convertPaymentJSONToPDF = (data, outputPath = null, Title = "Payment Summary", Author = "Oradigitals") => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      if (outputPath) {
        doc.pipe(fs.createWriteStream(outputPath));
      } else {
        doc.on("data", (chunk) => buffers.push(chunk));
      }

      // Function to draw a border around the page content area
      const drawBorder = () => {
        const { width, height, margins } = doc.page;
        doc
          .save() // Save current graphics state
          .lineWidth(1) // Set line width for the border
          .strokeColor("#000") // Set stroke color to black
          .rect(
            margins.left / 2, // X-coordinate for the top-left corner (slightly inside margin)
            margins.top / 2,  // Y-coordinate for the top-left corner (slightly inside margin)
            width - margins.left, // Width of the rectangle (page width minus total horizontal margin)
            height - margins.top  // Height of the rectangle (page height minus total vertical margin)
          )
          .stroke() // Draw the rectangle border
          .restore(); // Restore previous graphics state
      };

      // Add border to each new page
      doc.on("pageAdded", drawBorder);
      // Draw border on the first page
      drawBorder();

      // Set PDF metadata
      doc.info.Title = Title;
      doc.info.Author = Author;

      // Add main title to the document
      doc
        .fontSize(20)
        .fillColor("#333") // Dark gray color
        .text("Oradigitals - Payment Summary Report", { align: "center", underline: true });

      doc.moveDown(2); // Move cursor down by 2 lines

      // --- Table Setup ---
      const headers = ["Project", "Client", "Total (PKR)", "Paid (PKR)", "Remaining", "Status"];
      // Define column widths. Adjusted for better fit and to prevent overlapping.
      // Total width: 115 + 90 + 80 + 70 + 80 + 60 = 495.
      // Usable page width (A4 with 50pt margins): 595.28 - (2 * 50) = 495.28. This fits perfectly.
      const colWidths = [115, 90, 80, 70, 80, 60];
      // Start X-coordinate for the table, aligned with the page's left margin
      const startX = doc.page.margins.left;
      // Padding inside each cell for text
      const textPadding = 5;
      // Minimum row height to ensure some spacing even for single-line text
      const minRowHeight = 25;

      let y = doc.y; // Get current Y-position for table start

      // Pre-calculate X positions for each column
      const colXPositions = [];
      let currentXPos = startX;
      colWidths.forEach(width => {
        colXPositions.push(currentXPos);
        currentXPos += width;
      });

      // Draw Header Background
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), minRowHeight) // Use minRowHeight for header
        .fill("#4a90e2"); // Blue background for header

      // Write Headers
      doc.fontSize(12).fillColor("white"); // White color for header text
      headers.forEach((text, idx) => {
        // Calculate vertical center for header text based on minRowHeight
        const headerTextY = y + (minRowHeight - doc.currentLineHeight()) / 2;
        // Text is placed at the pre-calculated column X position plus padding
        doc.text(text, colXPositions[idx] + textPadding, headerTextY, {
          width: colWidths[idx] - textPadding * 2, // Ensure text wraps within column if too long
          align: "left" // Headers are left-aligned
        });
      });

      // Move to the Y-position for the first data row
      y += minRowHeight; // Move down by minRowHeight after header

      // Data rows
      data.forEach((item, i) => {
        const isEven = i % 2 === 0;

        // Prepare cells data
        const cells = [
          item.project_title || '',
          item.client_name || '',
          `PKR ${Number(item.total_project_amount || 0).toLocaleString()}`,
          `PKR ${Number(item.total_paid_amount || 0).toLocaleString()}`,
          `PKR ${Number(item.remaining_amount || 0).toLocaleString()}`,
          (item.payment_status ? item.payment_status.toUpperCase() : '')
        ];

        // Calculate dynamic row height for the current row
        let currentRowHeight = minRowHeight;
        doc.fontSize(10); // Set font size for data rows to calculate text height accurately
        cells.forEach((text, idx) => {
          const cellWidth = colWidths[idx] - textPadding * 2;
          const textHeight = doc.heightOfString(text, { width: cellWidth });
          // Add extra padding for multi-line text to avoid it touching the row border
          const calculatedHeight = textHeight + textPadding * 2;
          if (calculatedHeight > currentRowHeight) {
            currentRowHeight = calculatedHeight;
          }
        });

        // Draw Row background (alternating colors for readability)
        doc.fillColor(isEven ? "#f9f9f9" : "#ffffff")
          .rect(startX, y, colWidths.reduce((a, b) => a + b), currentRowHeight)
          .fill();

        // Set font size and color for row content
        doc.fillColor("black").fontSize(10);

        cells.forEach((text, idx) => {
          // Determine alignment: numeric columns (2-4) are right-aligned, others left
          const align = idx >= 2 && idx <= 4 ? "right" : "left";
          // Determine text color based on payment status
          const color = idx === 5
            ? text === "PAID" ? "green" : text === "PARTIAL" ? "orange" : "red"
            : "black";

          doc.fillColor(color);

          // Calculate vertical center for text within the dynamically sized row
          const textY = y + (currentRowHeight - doc.heightOfString(text, { width: colWidths[idx] - textPadding * 2 })) / 2;

          // For all alignments, start text at the column's X position plus padding.
          // The 'align' property in doc.text will handle the internal alignment within the specified width.
          let cellTextX = colXPositions[idx] + textPadding;
          let cellWidth = colWidths[idx] - textPadding * 2;

          doc.text(text, cellTextX, textY, {
            width: cellWidth, // Ensure text wraps within column if too long
            align: align, // Use align property for internal text wrapping (left, center, right)
          });
        });

        y += currentRowHeight; // Move to the Y-position for the next row based on dynamic height

        // Page break logic: if current Y + next row height is too close to bottom margin, add new page
        // Use a buffer for the next row's height, assuming at least minRowHeight for the next row.
        if (y + minRowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage(); // Add a new page
          y = doc.y; // Reset Y to the top margin of the new page
          // If you want headers on every page, you would redraw them here.
          // For this basic table, we're not redrawing headers on subsequent pages.
        }
      });

      // Footer
      doc
        .moveDown(2) // Move cursor down
        .fontSize(10)
        .fillColor("gray") // Gray color for footer text
        .text(`Generated on: ${new Date().toLocaleString()}`, {
            align: "right",
            width: doc.page.width - doc.page.margins.right - doc.page.margins.left, // Use full usable width
            x: doc.page.margins.left // Start at left margin
        });

      doc.end(); // Finalize the PDF document

      // Resolve the promise based on output type
      if (outputPath) {
        doc.on("end", () => {
          resolve(`PDF saved to ${outputPath}`);
        });
      } else {
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
      }
    } catch (err) {
      reject(err); // Reject promise on error
    }
  });
};

module.exports = { convertPaymentJSONToPDF };
