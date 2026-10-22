// Read-only reproduction of optional reservationTerms in reservationApi.AvailabilityList.
// Also serves the read-only reservation -> place -> directions selection path.
// No reservation creation endpoint is served by this mock.
const http = require('http');
// Synthetic catalog data shaped by the checked-in place exploration/detail contracts.
const namedPlace = { id: 70095, name: '용짬뽕', address: '검증용 대구 주소', roadAddress: null,
  latitude: 35.9, longitude: 128.6, touristCategories: [], operatingStatus: 'OPERATING',
  englishName: null, jibunAddress: null, postalCode: null, geocodingSource: 'ADMIN',
  operatingStatusCheckedAt: null, currentlyOperating: true, currentlyOperatingCheckedAt: '2030-10-19T00:00:00Z',
  regularHours: [], operatingExceptions: [], activeOperatingNotices: [], description: null, touristSummary: null,
  primaryInformationSource: 'ADMIN', informationVerificationStatus: 'UNVERIFIED', informationVerifiedAt: null,
  informationEvidenceUpdatedAt: null, verifiedEvidenceCount: 0, lastVerifiedAt: null, lastVerifiedSourceType: null,
  registrant: 'ADMIN', communityViewCount: 0, merchantOwner: null };
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/ai/chat') {
    const answer = body => {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const currentInput = messages.findLastIndex(message => message.role === 'user' && typeof message.content === 'string');
      const blocks = messages.slice(currentInput + 1).flatMap(message => Array.isArray(message.content) ? message.content : []);
      const result = blocks.findLast(block => block.type === 'tool_result');
      const found = result && JSON.parse(result.content).data?.places?.find(place => place.id === namedPlace.id);
      const opensPage = /페이지|상세/.test(messages[currentInput]?.content ?? '');
      const tool = result ? found && opensPage ? { name: 'navigateToPage', input: { page: 'placeDetail', placeId: found.id } } : null
        : { name: 'searchNearbyPlaces', input: { keyword: namedPlace.name, matchSource: 'name' } };
      res.writeHead(200);
      res.end(JSON.stringify({ type: 'message', role: 'assistant', stop_reason: tool ? 'tool_use' : 'end_turn',
        content: tool ? [{ type: 'tool_use', id: `${result ? 'open-real-place' : 'lookup-name'}-${messages.length}`, ...tool }]
          : [{ type: 'text', text: found ? '요청하신 장소를 찾았어요.' : '이번 조회에서 일치하는 장소를 찾지 못했어요.' }] }));
    };
    if (req.body) answer(req.body);
    else {
      let raw = ''; req.on('data', chunk => { raw += chunk; });
      req.on('end', () => { answer(JSON.parse(raw)); });
    }
    return;
  }
  if (req.method === 'GET' && url.pathname === '/places') {
    const scoped = ['latitude', 'longitude', 'radiusKm', 'category', 'touristCategory'].some(key => url.searchParams.has(key));
    const places = !scoped && url.searchParams.get('keyword') === namedPlace.name
      ? [{ id: namedPlace.id, name: namedPlace.name, address: namedPlace.address, category: 'RESTAURANT', touristCategories: [] }] : [];
    res.writeHead(200);
    res.end(JSON.stringify({ places, page: 1, limit: 12, totalCount: places.length, totalPages: places.length ? 1 : 0, hasNext: false })); return;
  }
  if (req.method === 'GET' && url.pathname === '/places/70095') {
    res.writeHead(200); res.end(JSON.stringify(namedPlace)); return;
  }
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
