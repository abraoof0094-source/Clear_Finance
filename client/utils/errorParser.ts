// Comprehensive error parser to handle any error object format
export function parseError(error: any): { message: string; details: string } {
  console.log('Raw error object:', error);
  console.log('Error type:', typeof error);
  console.log('Error constructor:', error?.constructor?.name);
  
  // Try multiple approaches to extract error information
  let message = 'Unknown error';
  let details = '';
  
  try {
    // Method 1: Check common error properties
    if (error?.error_description) {
      message = error.error_description;
      details = error.error || '';
    } else if (error?.error) {
      if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.error?.message) {
        message = error.error.message;
        details = error.error.details || '';
      }
    }
    
    // Method 2: Check message property
    else if (error?.message) {
      message = error.message;
      details = error.details || error.stack || '';
    }
    
    // Method 3: Check details property
    else if (error?.details) {
      message = error.details;
    }
    
    // Method 4: Check if it's a string
    else if (typeof error === 'string') {
      message = error;
    }
    
    // Method 5: Check for Google API specific error format
    else if (error?.result?.error) {
      const gError = error.result.error;
      message = gError.message || gError.code || 'Google API Error';
      details = `Code: ${gError.code}, Status: ${gError.status}`;
    }
    
    // Method 6: Check for nested error
    else if (error?.response?.error) {
      const rError = error.response.error;
      message = rError.message || rError.error_description || 'Response Error';
      details = rError.error || '';
    }
    
    // Method 7: Try to stringify the entire object
    else {
      try {
        const stringified = JSON.stringify(error, null, 2);
        if (stringified && stringified !== '{}' && stringified !== 'null') {
          message = 'Complex error object';
          details = stringified;
        } else {
          // Last resort: use Object.keys to inspect the object
          const keys = Object.keys(error || {});
          if (keys.length > 0) {
            message = `Error object with keys: ${keys.join(', ')}`;
            details = keys.map(key => `${key}: ${error[key]}`).join('\n');
          }
        }
      } catch (stringifyError) {
        message = 'Error object cannot be parsed';
        details = error?.toString() || 'No details available';
      }
    }
    
    // Additional debugging: Log all object properties
    if (error && typeof error === 'object') {
      console.log('All error object keys:', Object.keys(error));
      for (const key in error) {
        console.log(`error.${key}:`, error[key]);
      }
    }
    
  } catch (parseError) {
    console.error('Error parsing failed:', parseError);
    message = 'Error parsing failed';
    details = error?.toString() || 'No details available';
  }
  
  return {
    message: message || 'Unknown error',
    details: details || 'No additional details'
  };
}

// Google API specific error parser
export function parseGoogleError(error: any): { message: string; details: string } {
  console.log('Parsing Google error:', error);
  
  // Common Google API error patterns
  const patterns = [
    // OAuth errors
    { path: 'error', messagePath: 'error_description' },
    { path: 'error', messagePath: 'message' },
    
    // API response errors
    { path: 'result.error', messagePath: 'message' },
    { path: 'result.error', messagePath: 'details' },
    
    // Auth2 errors
    { path: 'details', messagePath: null },
    { path: 'error_description', messagePath: null },
    
    // Generic errors
    { path: 'message', messagePath: null },
  ];
  
  for (const pattern of patterns) {
    try {
      const errorObj = pattern.path.split('.').reduce((obj, key) => obj?.[key], error);
      if (errorObj) {
        const message = pattern.messagePath 
          ? pattern.messagePath.split('.').reduce((obj, key) => obj?.[key], errorObj)
          : errorObj;
        
        if (message && typeof message === 'string') {
          return {
            message,
            details: JSON.stringify(error, null, 2)
          };
        }
      }
    } catch (e) {
      // Continue to next pattern
    }
  }
  
  // Fallback to general error parser
  return parseError(error);
}
