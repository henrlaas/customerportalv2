
// API route that fetches SMS credits from the external service

export default async function handler(req, res) {
  try {
    // Use https module instead of axios to have more control over the response
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
    
    try {
      const count = await fetchSMSCount();
      // Return the data from the external API as plain text
      res.status(200).send(count);
    } catch (error) {
      console.error('Error fetching SMS count:', error.message);
      res.status(500).send('Error fetching SMS count');
    }
  } catch (error) {
    console.error('Error in SMS count handler:', error.message);
    res.status(500).send('Error processing SMS count request');
  }
}
