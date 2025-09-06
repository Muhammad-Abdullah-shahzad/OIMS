exports.monthlyDeductions = (basicSalary, grossEarnings) => {
    basicSalary   = parseFloat(basicSalary)   || 0;
    grossEarnings = parseFloat(grossEarnings) || 0;
  
    // Provident Fund = 8% of basic salary (monthly)
    const monthlyProvidentFund = basicSalary * 0.08;
  
    // --- Income Tax Calculation (Pakistan FY 2024–25 progressive slabs) ---
    const annualIncome = grossEarnings * 12;
    let annualTax = 0;
  
    if (annualIncome <= 600000) {
      annualTax = 0;
    } else if (annualIncome <= 1200000) {
      annualTax = (annualIncome - 600000) * 0.05;
    } else if (annualIncome <= 2200000) {
      annualTax = 30000 + (annualIncome - 1200000) * 0.15;
    } else if (annualIncome <= 3200000) {
      annualTax = 180000 + (annualIncome - 2200000) * 0.20;
    } else {
      annualTax = 380000 + (annualIncome - 3200000) * 0.25;
    }
  
    const monthlyIncometax = annualTax / 12;
  
    // Total deductions for the month
    const totalMonthlyDeduction = monthlyProvidentFund + monthlyIncometax;
  
    return {
      monthlyProvidentFund,
      monthlyIncometax,
      totalMonthlyDeduction
    };
  };
  