import validateForm from "./validateForm";
// Function to handle form submission
const handleSubmit = async ({e,firstName,lastName,email,password,confirmPassword,setValidationErrors,setError,setSuccessMessage,setLoading,setFirstName,setLastName,setEmail,setConfirmPassword,AUTH_API_URL,setPassword}) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Perform client-side validation
    if (!validateForm(firstName,lastName,email,password,confirmPassword,setValidationErrors)) {
      setError('Please correct the form errors.');
      return; // Stop submission if validation fails
    }

    setLoading(true); // Set loading state to true
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only necessary data; password hashing should happen on backend
        body: JSON.stringify({  
          email, 
          password,
           firstName,
           lastName ,
           role:"super_admin" }), // Changed to send firstName and lastName
      });

      const data = await response.json(); // Parse response body as JSON

      if (response.ok) { // Check if response status is 2xx
        setSuccessMessage(data.message || 'Account created successfully! You can now log in.');
        // Optionally, clear the form or redirect the user
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setValidationErrors({}); // Clear any remaining validation errors
        // Example: Redirect to login page after a short delay
        // setTimeout(() => {
        //   window.location.href = '/login';
        // }, 2000);
      } else {
        // Handle API errors (e.g., 400 Bad Request, 409 Conflict)
        setError(data.message || 'Failed to create account. Please try again.');
        console.error('Signup error:', data);
      }
    } catch (networkError) {
      // Handle network errors (e.g., server unreachable)
      setError('Network error: Could not connect to the server. Please check your internet connection.');
      console.error('Network error during signup:', networkError);
    } finally {
      setLoading(false); // Always set loading to false after request completes
    }
  };
export default handleSubmit