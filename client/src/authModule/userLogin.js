// login.js
const loginUser = async ({ email, password, Base_Url }) => {
    try {
      const response = await fetch(`${Base_Url}/login`, {  // ideally this should be `/login`
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
    
      localStorage.setItem("token",data.token)
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      return { success: true, data }; // data.token should be in response
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, message: error.message };
    }
  };
  
  export default loginUser;
  