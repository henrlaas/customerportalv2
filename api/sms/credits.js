
// API route that fetches SMS credits from the external service

// Use https module as recommended
const https = require('https');

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Configuration
  const username = 'box';
  const password = '4bbc3a48af044f74';
  const creditsUrl = 'https://sveve.no/SMS/AccountAdm';

  // Create a promise to handle the request
  const fetchSMSCount = () => {
    return new Promise((resolve, reject) => {
      const url = `${creditsUrl}?cmd=sms_count&user=${username}&passwd=${password}`;

      https.get(url, (response) => {
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

  // Execute the fetch and send response
  fetchSMSCount()
    .then((count) => {
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(count);
    })
    .catch((error) => {
      console.error('Error fetching SMS count:', error.message);
      res.status(500).send('Error fetching SMS count');
    });
}
