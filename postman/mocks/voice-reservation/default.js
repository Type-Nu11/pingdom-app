// Read-only reproduction of optional reservationTerms in reservationApi.AvailabilityList.
// No reservation creation endpoint is served by this mock.
const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/places/70095/availabilities') {
    res.writeHead(200);
    res.end(JSON.stringify([{ id: 77, placeId: 70095, productType: 'GENERAL', productId: null, productName: null,
      startsAt: '2030-10-20T05:00:00Z', endsAt: '2030-10-20T06:00:00Z',
      totalCapacity: 4, remainingCapacity: 4, status: 'ACTIVE', conditionsVersion: 1, reservationTerms: null }]));
    return;
  }
  res.writeHead(501);
  res.end(JSON.stringify({ message: 'Not part of this read-only reproduction' }));
}).listen(Number(process.env.PORT || 4907), '127.0.0.1');
