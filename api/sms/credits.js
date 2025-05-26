
// API route that fetches SMS credits from the external service

export default async function handler(req, res) {
  try {
    // Use https module to fetch the SMS count
    const https = require('https');
    
    const fetchSMSCount = () => {
      return new Promise((resolve, reject) => {
        https.get('https://sveve.no/SMS/AccountAdm?cmd=sms_count&user=box&passwd=4bbc3a48af044f74', (response) => {
          let data = '';
          
          // A chunk of data has been received
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          // The whole response has been received
          response.on('end', () => {
            resolve(data.trim());
          });
        }).on('error', (err) => {
          reject(err);
        });
      });
    };
    
    const count = await fetchSMSCount();
    
    // Check if account is deleted
    if (count === "Kontoen er slettet") {
      res.status(200).json({
        credits: 0,
        accountDeleted: true
      });
      return;
    }
    
    // Parse the number
    const credits = parseInt(count, 10);
    
    if (isNaN(credits)) {
      throw new Error("Invalid response format from API");
    }
    
    res.status(200).json({
      credits: credits,
      accountDeleted: false
    });
  } catch (error) {
    console.error('Error in SMS count handler:', error.message);
    res.status(500).json({
      error: 'Error processing SMS count request',
      credits: 0,
      accountDeleted: false
    });
  }
}
