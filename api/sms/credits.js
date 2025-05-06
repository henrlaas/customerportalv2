// API route that fetches SMS credits from the external service
export default async function handler(req, res) {
  try {
    // Use https module instead of axios to have more control over the response
    const https = require('https');
    
    const fetchSMSCount = () => {
      return new Promise((resolve, reject) => {
        // Make sure we're using the right parameter format for the API
        const url = 'https://sveve.no/SMS/AccountAdm?cmd=sms_count&user=box&passwd=4bbc3a48af044f74&f=json';
        
        console.log('Fetching SMS count from:', url);
        
        https.get(url, (response) => {
          let data = '';
          
          // A chunk of data has been received
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          // The whole response has been received
          response.on('end', () => {
            console.log('Raw API response:', data);
            
            // Try to parse as JSON first
            try {
              const jsonData = JSON.parse(data);
              console.log('Parsed JSON response:', jsonData);
              
              // Check if it's in the expected format
              if (jsonData && jsonData.response && jsonData.response.sms_count !== undefined) {
                resolve(jsonData.response.sms_count);
              } else if (jsonData && typeof jsonData === 'object') {
                // Try to find a key that might contain the count
                const possibleCountKeys = Object.keys(jsonData).filter(key => 
                  typeof jsonData[key] === 'number' || 
                  (typeof jsonData[key] === 'string' && !isNaN(parseInt(jsonData[key], 10)))
                );
                
                if (possibleCountKeys.length > 0) {
                  const count = jsonData[possibleCountKeys[0]];
                  resolve(typeof count === 'number' ? count : parseInt(count, 10));
                } else {
                  console.log('Could not find count in response:', jsonData);
                  resolve(data.trim()); // Fallback to raw response
                }
              } else {
                // JSON parsed but not in expected format
                resolve(data.trim());
              }
            } catch (error) {
              console.log('Not a JSON response, trying as plain text');
              
              // Not JSON, try to parse as plain number
              const trimmed = data.trim();
              const num = parseInt(trimmed, 10);
              
              if (!isNaN(num)) {
                console.log(num);
                resolve(num);
              } else {
                console.log('Not a number response:', trimmed);
                resolve(trimmed); // Return as-is and let client handle
              }
            }
          });
        }).on('error', (err) => {
          console.error('HTTPS request error:', err);
          reject(err);
        });
      });
    };
    
    try {
      const count = await fetchSMSCount();
      console.log('Sending count to client:', count);
      res.status(200).send(count.toString());
    } catch (error) {
      console.error('Error fetching SMS count:', error.message);
      res.status(500).send('Error fetching SMS count');
    }
  } catch (error) {
    console.error('Error in SMS count handler:', error.message);
    res.status(500).send('Error processing SMS count request');
  }
}