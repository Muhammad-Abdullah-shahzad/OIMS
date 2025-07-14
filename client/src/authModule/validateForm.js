const validateForm = (firstName,lastName,email,password,confirmPassword,setValidationErrors) => {
    const errors = {};
    if (!firstName.trim()) {
      errors.firstName = 'First Name is required.';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last Name is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

 export default validateForm 