exports.getYTD = (hire_date, salaryPerMonth) => {
    const today = new Date();
    const currentYear = today.getFullYear();
  
    const doj = new Date(hire_date);
    const dojYear = doj.getFullYear();
  
    // Case 1: DOJ in future (not yet joined)
    if (doj > today) {
      return 0;
    }


  
    let startMonth;
    if (dojYear === currentYear) {
      // Started this year → start from DOJ month
      startMonth = doj.getMonth() + 1; // JS months are 0-based
    } else if (dojYear < currentYear) {
      // Started last year or earlier → start from January
      startMonth = 1;
    } else {
      // Future joining
      return 0;
    }
  
    const currentMonth = today.getMonth() + 1;
  
    // Months worked this year
    const monthsWorked = currentMonth - startMonth + 1;
  
    // Earnings YTD
    return parseFloat(monthsWorked * salaryPerMonth);
  };
  