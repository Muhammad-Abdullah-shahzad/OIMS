// payslipGenerator.js
const puppeteer = require("puppeteer");

/**
 * Generates an HTML string for the payslip using the provided data.
 * @param {object} data The payslip data object.
 * @returns {string} The complete HTML document as a string.
 */
function generateSlipHTML(data) {
    const createHtmlString = () => {
        let html = '';
        const maxRows = Math.max(data.earnings.length, data.deductions.length);
        
        for (let i = 0; i < maxRows; i++) {
            const earning = data.earnings[i] || {};
            const deduction = data.deductions[i] || {};

            html += `
                <tr class="table-row">
                    <td class="table-cell table-cell-border">${earning.description || ''}</td>
                    <td class="table-cell text-right table-cell-border">${earning.current || ''}</td>
                    <td class="table-cell text-right table-cell-border">${earning.ytd || ''}</td>
                    <td class="table-cell table-cell-border">${deduction.description || ''}</td>
                    <td class="table-cell text-right table-cell-border">${deduction.current || ''}</td>
                    <td class="table-cell text-right table-cell-border">${deduction.ytd || ''}</td>
                </tr>
            `;
        }
        return html;
    };

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Salary Slip</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 2rem;
                    color: #1a202c;
                }

                .payslip-container {
                    max-width: 21cm;
                    min-height: 29.7cm;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 2rem;
                  //   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  //   border-radius: 0.75rem;
                }
                
                /* Header Section */
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .header-logo {
                    color: #000;
                    font-size: 1rem;
                    font-weight: 700;
                }
                
                .header-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #000;
                    text-align: right;
                }

                /* Details Section */
                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0,1fr));
                    column-gap: 3rem;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                }

                .details-list {
                    display: flex;
                    flex-direction: column;
                    margin-bottom:0px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom:-10px;
                }
                
                .detail-label {
                    font-weight:400;
                    color: green;
                }

                .detail-value {
                    color: #1f2937;
                    font-weight: 200;
                    text-align: right;
                }

                /* Table Styling */
                .payslip-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                }

                .table-row {
                    height: 2rem;
                }

                .table-header {
                    background-color: #e8f4e6;
                    color: #000;
                    font-weight: 500;
                    padding: 0.5rem;
                    text-align: center;
                }

                .table-cell {
                    padding: 0.5rem;
                    text-align: left;
                }

                .text-right {
                    text-align: right;
                }

                .table-cell-border {
                    border: 1px solid #a7d3a2;
                }

                .table-total-row {
                    background-color: #f5f9f5;
                    font-weight: 600;
                }
                
                .net-pay-bar {
                  
                    color: #000;
                    font-weight: 400;
                    padding: 0px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 0.5rem;
                    font-size:16px;
                }
                
                .net-pay-value {
                    font-weight: 400;
                    font-size: 16px;
                }

                .net-pay-words {
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                /* Footer */
                .footer-box {
                    padding: 1rem;
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    color: #4b5563;
                }
                
                .footer-box p {
                    margin-bottom: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div id="payslip-wrapper" class="payslip-container">
                <!-- Header Section -->
                <div class="header-container">
                    <div class="flex items-center">
                        <span class="header-logo">Oradigitals Consultants</span>
                    </div>
                    <div>
                        <h1 class="header-title">${data.slipTitle}</h1>
                    </div>
                </div>

                <!-- Employee and Job Details Section -->
                <div class="details-grid">
                    <div class="details-list">
                        ${data.employeeDetails.map(item => `
                            <p class="detail-row">
                                <span class="detail-label">${item.label}</span>
                                <span class="detail-value">${item.value}</span>
                            </p>
                        `).join('')}
                    </div>
                    <div class="details-list">
                        ${data.jobDetails.map(item => `
                            <p class="detail-row">
                                <span class="detail-label">${item.label}</span>
                                <span class="detail-value">${item.value}</span>
                            </p>
                        `).join('')}
                    </div>
                </div>

                <!-- Earnings and Deductions Table -->
                <table class="payslip-table">
                    <thead>
                        <tr>
                            <th colspan="3" class="table-header table-cell-border">EARNINGS</th>
                            <th colspan="3" class="table-header table-cell-border">DEDUCTIONS</th>
                        </tr>
                        <tr>
                            <th class="table-header table-cell-border table-cell">DESCRIPTION</th>
                            <th class="table-header table-cell-border table-cell text-right">CURRENT</th>
                            <th class="table-header table-cell-border table-cell text-right">Y.T.D</th>
                            <th class="table-header table-cell-border table-cell">DESCRIPTION</th>
                            <th class="table-header table-cell-border table-cell text-right">CURRENT</th>
                            <th class="table-header table-cell-border table-cell text-right">Y.T.D</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${createHtmlString()}
                    </tbody>
                    <tfoot>
                        <tr class="table-total-row">
                            <td class="table-cell table-cell-border">Total Earnings</td>
                            <td class="table-cell table-cell-border text-right">${data.grossEarnings}</td>
                            <td class="table-cell table-cell-border text-right">2,491,002.00</td>
                            <td class="table-cell table-cell-border">Total Deductions</td>
                            <td class="table-cell table-cell-border text-right">${data.totalDeductions}</td>
                            <td class="table-cell table-cell-border text-right">287,335.37</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Net Pay Section -->
                <div class="net-pay-bar">
                    <p>Net Pay</p>
                    <p class="net-pay-value">${data.netPay}</p>
                </div>

                <!-- Net Pay in Words -->
                <p class="net-pay-words">${data.netPayWords}</p>

                <!-- Footer Section -->
                <div class="footer-box">
                    ${data.notes.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Generates a PDF from the given payslip data and returns a buffer.
 * @param {object} payslipData The data to populate the payslip.
 * @returns {Promise<Buffer>} A Promise that resolves with the PDF buffer.
 */
async function convertSalaryJsonToPdf(payslipData) {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Check if payslipData is valid
        if (!payslipData || typeof payslipData !== 'object') {
            throw new Error("Invalid or empty employee salary data provided.");
        }

        const htmlContent = generateSlipHTML(payslipData);

        await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 60000 });
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        return pdfBuffer;
    } catch (error) {
        console.error("❌ An error occurred while generating the payslip:", error);
        throw error; 
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = convertSalaryJsonToPdf;
