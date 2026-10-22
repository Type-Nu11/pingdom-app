// Read-only reproduction of optional reservationTerms in reservationApi.AvailabilityList.
// Also serves the read-only reservation -> place -> directions selection path.
// No reservation creation endpoint is served by this mock.
const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/reservations') {
    if (url.searchParams.get('page') !== '1' || url.searchParams.get('limit') !== '20') {
      res.writeHead(400); res.end(JSON.stringify({ message: 'Expected page=1&limit=20' })); return;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ page: 1, limit: 20, hasNext: false, totalElements: 1, reservations: [{
      id: 9001, touristUserId: 101, availabilityId: 77, productId: null, productType: 'GENERAL', quantity: 1,
      status: 'CONFIRMED', createdAt: '2030-10-19T00:00:00Z', updatedAt: '2030-10-19T00:00:00Z',
      reservationStartsAt: '2030-10-30T03:00:00Z', reservationEndsAt: '2030-10-30T04:00:00Z',
      confirmedAt: '2030-10-19T00:00:00Z', canceledAt: null, bookerName: null, bookerPhone: null, requestNote: null,
      confirmation: { placeId: 70096, placeName: '예약 길찾기 검증 장소', availabilityId: 77, quantity: 1,
        startsAt: '2030-10-30T03:00:00Z', endsAt: '2030-10-30T04:00:00Z', timezone: 'Asia/Seoul',
        cancellable: true, cancellationDeadline: null, conditionsVersion: 1, expiresAt: '2030-10-30T03:00:00Z' },
    }] })); return;
  }
  if (req.method === 'GET' && url.pathname === '/places/70096') {
    res.writeHead(200);
    res.end(JSON.stringify({ id: 70096, name: '예약 길찾기 검증 장소', address: '대구 북구', roadAddress: '대구 북구 엑스코로 10',
      latitude: 35.9, longitude: 128.6, touristCategories: ['FOOD'], operatingStatus: 'OPERATING',
      englishName: null, jibunAddress: null, postalCode: null, geocodingSource: 'ADMIN',
      operatingStatusCheckedAt: null, currentlyOperating: true, currentlyOperatingCheckedAt: '2030-10-19T00:00:00Z',
      regularHours: [], operatingExceptions: [], activeOperatingNotices: [], description: null, touristSummary: null,
      primaryInformationSource: 'ADMIN', informationVerificationStatus: 'UNVERIFIED', informationVerifiedAt: null,
      informationEvidenceUpdatedAt: null, verifiedEvidenceCount: 0, lastVerifiedAt: null, lastVerifiedSourceType: null,
      registrant: 'ADMIN', communityViewCount: 0, merchantOwner: null })); return;
  }
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
