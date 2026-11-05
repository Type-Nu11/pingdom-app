import type { QueryClient } from '@tanstack/react-query';
import { createPostsQueryOptions, createPostQueryOptions } from '../../community';
import { createPlaceListQueryOptions, createPlaceDetailQueryOptions, createPlaceMenusQueryOptions, placeQueryKeys } from '../../place';
import type { PlaceList } from '../../place';
import { createAvailabilitiesQueryOptions, createReservationQuoteQueryOptions, createReservationsQueryOptions, isSelectableAvailability, NEARBY_RESERVATION_CANDIDATE_LIMIT, type AvailabilityList } from '../../booking';
import { ApiError } from '../../../shared/api';
import { areServerInstantsEqual } from '../../../shared/model';
import { parseVoiceAssistantEnvelope } from './voiceAssistantCommandParser';
import { VOICE_COMMAND_POLICIES } from './voiceAssistantCommandPolicy';
import type { AppCommandResult, CommandFailureCode, CommandRequest, VoiceAvailabilityFacts, VoiceCommandName, VoiceCommandOutput, VoicePlaceFacts, VoiceNavigationTarget, VoiceSearchEvidence } from './voiceAssistantCommand.types';
import { findDiscoveryEvidence } from './placeDiscoveryEvidence';
import { VoiceSessionError } from './voiceSessionError';
import type { VoiceDeliveryContext, VoiceEnvelopeConsumer } from './voiceSession';
import { observeVoiceQuery, type VoiceQueryOptions } from './voiceCommandQuery';
import { createVoiceProvenance, VOICE_PROVENANCE_MAX_AGE, type VoicePlaceProvenance, type VoiceProvenanceScope } from './voiceCommandProvenance';
import { serverInstant, voiceTimeRange, VoiceClarification, VoiceCommandError } from './voiceCommandTime';
import { prepareVoiceReservationDraft } from './reservationDraft';

export const voiceReadQueries = Object.freeze({ list: createPlaceListQueryOptions, detail: createPlaceDetailQueryOptions, availability: createAvailabilitiesQueryOptions, quote: createReservationQuoteQueryOptions,
  menus: createPlaceMenusQueryOptions,
  reservations: createReservationsQueryOptions,
  posts: createPostsQueryOptions, post: createPostQueryOptions });
export type VoiceCommandRuntime = Readonly<{
  accountRevision: string | null; contextRevision: number;
  session: Readonly<{ sessionId: string; epoch: symbol; generation: number }> | undefined;
  location: Readonly<{ latitude: number; longitude: number }> | null;
  locationPermission: string; radiusKm: number; timezone: string; placeListEnabled: boolean;
  now: () => number; monotonic: () => number; queryClient: QueryClient;
  /** User-selected ID only. Authorization still requires an existing successful detail Query. */
  selectedPlaceId?: number;
  /** App-owned allowlisted router/sheet entry. true means dispatch accepted, not rendered completion. */
  navigateToPage?: (target: VoiceNavigationTarget) => boolean;
}>;
type Queries = {
  menus: typeof createPlaceMenusQueryOptions;
  reservations: typeof createReservationsQueryOptions;
  posts: typeof createPostsQueryOptions;
  post: typeof createPostQueryOptions;
  list: (params: Parameters<typeof createPlaceListQueryOptions>[0]) => ReturnType<typeof createPlaceListQueryOptions>;
  detail: (id: number) => ReturnType<typeof createPlaceDetailQueryOptions>;
  availability: (id: number) => ReturnType<typeof createAvailabilitiesQueryOptions>;
  quote: (placeId: number, availabilityId: number, quantity: number, accountRevision: string) => ReturnType<typeof createReservationQuoteQueryOptions>;
};
type Execution = {
  runtime: VoiceCommandRuntime; scope: VoiceProvenanceScope; signal: AbortSignal;
  provenance: ReturnType<typeof createVoiceProvenance>; queries: Queries;
  check: () => void; force: boolean;
  query: <T>(options: VoiceQueryOptions<T>) => Promise<{ data: T; queryKey: VoiceQueryOptions<T>['queryKey']; dataUpdatedAt: number }>;
  commit: (() => void)[];
};
type Request<N extends VoiceCommandName> = Extract<CommandRequest, { command: N }>;
/** Draft preparation cannot represent a created booking. */
export type VoiceCommandHandler<N extends VoiceCommandName> = (command: Request<N>, execution: Execution) => Promise<VoiceCommandOutput[N]>;
type Registry = { readonly [N in VoiceCommandName]: Readonly<{
  name: N; policy: typeof VOICE_COMMAND_POLICIES[N];
  validate: (request: Request<N>, execution: Execution) => void;
  handler: VoiceCommandHandler<N>;
}> };
const validId = (id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0;
function invalid(): never { throw new VoiceCommandError('INVALID_SERVER_RESPONSE'); }
const categories = new Set(['K_POP', 'BEAUTY', 'FASHION', 'CAFE', 'FOOD', 'POP_UP', 'EXHIBITION', 'NIGHTLIFE', 'OTHER']);
export function projectVoicePlace(value: unknown, expectedId: number): VoicePlaceFacts {
  if (!value || typeof value !== 'object') return invalid();
  const p = value as VoicePlaceFacts;
  if (!validId(p.id) || p.id !== expectedId || typeof p.name !== 'string' || !p.name.trim()
    || typeof p.address !== 'string' || !Array.isArray(p.touristCategories)
    || p.touristCategories.some(c => !categories.has(c))
    || !['OPERATING', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED'].includes(p.operatingStatus)) return invalid();
  return Object.freeze({ id: p.id, name: p.name, address: p.address,
    touristCategories: Object.freeze([...p.touristCategories]) as unknown as VoicePlaceFacts['touristCategories'], operatingStatus: p.operatingStatus });
}
function slots(value: unknown, placeId: number, quantity: number, range: { start: number; end: number }, now: number): VoiceAvailabilityFacts[] {
  if (!Array.isArray(value)) return invalid();
  const seen = new Set<number>();
  return value.flatMap((s: AvailabilityList[number]) => {
    if (!s || !validId(s.id) || seen.has(s.id) || s.placeId !== placeId || !validId(s.placeId)
      || !['ACTIVE', 'INACTIVE'].includes(s.status)
      || !Number.isSafeInteger(s.remainingCapacity) || s.remainingCapacity < 0
      || !Number.isSafeInteger(s.totalCapacity) || s.totalCapacity < s.remainingCapacity
      || (s.productType !== undefined && !['GENERAL', 'TICKET', 'CLASS'].includes(s.productType))) return invalid();
    if (!isSelectableAvailability(s)) return [];
    seen.add(s.id);
    const start = serverInstant(s.startsAt), end = serverInstant(s.endsAt);
    if (start >= end) return invalid();
    if (s.status !== 'ACTIVE' || end <= now || s.remainingCapacity < quantity || start >= range.end || end <= range.start) return [];
    return [Object.freeze({ id: s.id, placeId: s.placeId,
      startsAt: s.startsAt, endsAt: s.endsAt, remainingCapacity: s.remainingCapacity, status: s.status })];
  }); // Preserve server order among place-only reservation slots.
}
function metadata(ex: Execution, ids: readonly number[], query: { queryKey: VoiceQueryOptions<unknown>['queryKey']; dataUpdatedAt: number }): VoicePlaceProvenance {
  return Object.freeze({ ...ex.scope, placeIds: Object.freeze([...ids]), ...query,
    observedAt: ex.runtime.monotonic() - Math.max(0, Date.now() - query.dataUpdatedAt) });
}
function matchingScope(p: VoicePlaceProvenance, ex: Execution) {
  return p.epoch === ex.scope.epoch && p.sessionId === ex.scope.sessionId && p.accountRevision === ex.scope.accountRevision
    && p.contextRevision === ex.scope.contextRevision && p.conditionRevision === ex.scope.conditionRevision && p.generation <= ex.scope.generation;
}
function requirePlace(request: { args: { placeId: number } }, ex: Execution) {
  const { placeId } = request.args;
  let known = ex.provenance.place(placeId);
  if (known && !matchingScope(known, ex)) { ex.provenance.clear(); known = undefined; }
  if (!known?.placeIds.includes(placeId)) {
    // Selecting a map POI or merely proposing an ID is not proof. Only a completed canonical detail query qualifies.
    const key = placeQueryKeys.detail(placeId);
    const state = ex.runtime.queryClient.getQueryState(key);
    if (ex.runtime.selectedPlaceId !== placeId || state?.status !== 'success') throw new VoiceCommandError('ID_NOT_IN_CONTEXT');
    projectVoicePlace(state.data, placeId);
    known = metadata(ex, [placeId], { queryKey: key, dataUpdatedAt: state.dataUpdatedAt });
    const selected = known;
    ex.commit.push(() => ex.provenance.recordVerifiedPlace(selected));
  }
  const age = ex.runtime.monotonic() - known.observedAt;
  ex.force = age < 0 || age >= VOICE_PROVENANCE_MAX_AGE;
}
function requireLocation(runtime: VoiceCommandRuntime) {
  const { location, locationPermission } = runtime;
  if (locationPermission !== 'granted' || !location || !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90
    || !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180) throw new VoiceCommandError('LOCATION_REQUIRED');
}
function validateSearch(request: Request<'searchNearbyReservablePlaces'> | Request<'searchNearbyPlaces'>, ex: Execution) {
  const { radiusKm, placeListEnabled } = ex.runtime;
  if (!placeListEnabled) throw new VoiceCommandError('FORBIDDEN');
  if (request.command === 'searchNearbyPlaces' && request.args.matchSource === 'name') return;
  if (!request.args.useCurrentLocation) throw new VoiceClarification('useCurrentLocation');
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) throw new VoiceCommandError('STALE_CONTEXT');
}
const DISCOVERY_CANDIDATE_LIMIT = 12;
type DiscoveryList = { data: PlaceList; queryKey: VoiceQueryOptions<PlaceList>['queryKey']; dataUpdatedAt: number };
async function searchDiscovery(request: Request<'searchNearbyPlaces'>, ex: Execution,
  initial: DiscoveryList,
): Promise<VoiceCommandOutput['searchNearbyPlaces']> {
  const args = request.args;
  const source = args.matchSource ?? 'any';
  const byName = source === 'name';
  const terms = byName ? [args.keyword!.trim()] : args.matchTerms ?? [args.keyword!.trim()];
  // Broader candidate words never become acceptance criteria.
  const keywords = [...new Set([args.keyword!, ...(source === 'name' ? [] : args.relatedKeywords ?? [])].map(word => word.trim()))];
  const inspect = async (lists: DiscoveryList[], hasNearby = false) => {
    const candidates = new Map<number, { item: NonNullable<PlaceList['places']>[number]; priority: number }>();
    for (const [index, list] of lists.entries()) {
      if (!list.data || !Array.isArray(list.data.places)) return invalid();
      for (const candidate of list.data.places.slice(0, DISCOVERY_CANDIDATE_LIMIT)) {
        if (!candidate || !validId(candidate.id)) return invalid();
        if (byName && (typeof candidate.name === 'string' || typeof candidate.englishName === 'string')
          && !findDiscoveryEvidence([candidate.name, candidate.englishName], terms)) continue;
        const distance = candidate.distanceMeters;
        if (distance !== undefined && (typeof distance !== 'number' || !Number.isFinite(distance) || distance < 0)) return invalid();
        // Inspect direct evidence and related-word hits before an unfiltered nearby sample.
        const priority = findDiscoveryEvidence([candidate.name, candidate.englishName, candidate.touristSummary, candidate.category], terms)
          ? 0 : hasNearby && index === lists.length - 1 ? 2 : 1;
        if (!candidates.has(candidate.id) || candidates.get(candidate.id)!.priority > priority) candidates.set(candidate.id, { item: candidate, priority });
      }
    }
    const nearest = [...candidates.values()].sort((a, b) => a.priority - b.priority
      || (a.item.distanceMeters ?? Infinity) - (b.item.distanceMeters ?? Infinity)).slice(0, DISCOVERY_CANDIDATE_LIMIT).map(candidate => candidate.item);
    return Promise.all(nearest.map(async candidate => {
      ex.check();
      const query = await ex.query(ex.queries.detail(candidate.id!));
      const place = projectVoicePlace(query.data, candidate.id!);
      if (place.operatingStatus === 'PERMANENTLY_CLOSED') return undefined;
      const detail = query.data;
      let evidence: VoiceSearchEvidence | undefined;
      if (source !== 'menu') {
        const name = findDiscoveryEvidence([place.name, detail.englishName], terms);
        const text = source === 'name' ? undefined : findDiscoveryEvidence([detail.description, detail.touristSummary, candidate.category], terms);
        if (name || text) evidence = { placeId: place.id, source: name ? 'name' : 'place', text: (name ?? text)! };
      }
      if (!evidence && (source === 'menu' || source === 'any')) {
        const menus = (await ex.query(ex.queries.menus(place.id))).data;
        if (!Array.isArray(menus)) return invalid();
        if (menus.some(menu => !menu || !validId(menu.id) || typeof menu.name !== 'string' || !menu.name.trim()
          || !['AVAILABLE', 'SOLD_OUT'].includes(menu.status ?? '')
          || (menu.placeId !== undefined && menu.placeId !== place.id))) return invalid();
        const text = findDiscoveryEvidence(menus.filter(menu => menu?.status === 'AVAILABLE')
          .flatMap(menu => [menu.name, menu.description]), terms);
        if (text) evidence = { placeId: place.id, source: 'menu', text };
      }
      return evidence ? { place, candidate, query, evidence } : undefined;
    }));
  };
  const direct = await inspect([initial]);
  let matches = direct.filter((match): match is NonNullable<typeof match> => Boolean(match)).slice(0, args.limit ?? 3);
  let radiusKm: number | undefined = byName ? undefined : ex.runtime.radiusKm;
  let lists = [initial];
  if (!matches.length && !byName) {
    radiusKm = 20; // Existing /places distance-search contract maximum.
    const queries: (string | undefined)[] = [...keywords, undefined];
    lists = await Promise.all(queries.map(keyword => ex.query(ex.queries.list({
      latitude: ex.runtime.location!.latitude, longitude: ex.runtime.location!.longitude,
      radiusKm, ...(keyword ? { keyword } : {}),
      ...(args.category ? { category: args.category } : {}),
      page: 1, limit: DISCOVERY_CANDIDATE_LIMIT, sort: 'NEAREST',
    }))));
    const expanded = await inspect(lists, true);
    matches = expanded.filter((match): match is NonNullable<typeof match> => Boolean(match))
      .sort((a, b) => (a.candidate.distanceMeters ?? Infinity) - (b.candidate.distanceMeters ?? Infinity)).slice(0, args.limit ?? 3);
  }
  ex.check();
  // Clear the previous search, then retain each actual detail query as its ID proof.
  const empty = metadata(ex, [], lists[0]);
  ex.commit.push(() => ex.provenance.recordPlaces(empty));
  for (const match of matches) {
    const proof = metadata(ex, [match.place.id], match.query);
    ex.commit.push(() => ex.provenance.recordVerifiedPlace(proof));
  }
  return Object.freeze({ coverage: 'bounded_candidates', search: Object.freeze({
    ...(byName ? { scope: 'catalog_name' as const } : { radiusKm }), keywords, matchedBy: 'place_or_menu',
    candidateLimit: DISCOVERY_CANDIDATE_LIMIT, evidence: Object.freeze(matches.map(match => Object.freeze(match.evidence))) }),
    places: Object.freeze(matches.map(({ candidate, place }) => Object.freeze({ ...place,
      ...(candidate.distanceMeters !== undefined ? { distanceMeters: candidate.distanceMeters } : {}) }))) });
}
/** General discovery never reads availability, quotes, or reservation mutations. */
const searchNearbyPlaces: VoiceCommandHandler<'searchNearbyPlaces'> = async (request, ex) => {
  const r = ex.runtime;
  const limit = request.args.limit ?? 3;
  const list = await ex.query(ex.queries.list(request.args.matchSource === 'name'
    ? { keyword: request.args.keyword!.trim(), page: 1, limit: DISCOVERY_CANDIDATE_LIMIT }
    : { latitude: r.location!.latitude, longitude: r.location!.longitude,
    radiusKm: r.radiusKm, page: 1, limit, sort: 'NEAREST',
    ...(request.args.keyword ? { keyword: request.args.keyword.trim() } : {}),
    ...(request.args.category ? { category: request.args.category } : {}),
    // Name/menu keywords take priority over inferred tourism tags. Legacy restaurant
    // category does not imply that its touristCategories contains FOOD.
    ...(!request.args.keyword?.trim() && request.args.touristCategory ? { touristCategory: request.args.touristCategory } : {}) }));
  if (!list.data || !Array.isArray(list.data.places)) return invalid();
  if (request.args.keyword && (!list.data.places.length || request.args.matchSource || request.args.matchTerms || request.args.relatedKeywords)) {
    return searchDiscovery(request, ex, list);
  }
  const seen = new Set<number>();
  const places: VoicePlaceFacts[] = [];
  for (const candidate of list.data.places.slice(0, limit)) {
    ex.check();
    if (!candidate || !validId(candidate.id) || seen.has(candidate.id)) return invalid();
    seen.add(candidate.id);
    // List summaries may omit operatingStatus. Only canonical detail may fill it; never infer it.
    const complete = candidate.name !== undefined && candidate.address !== undefined
      && candidate.touristCategories !== undefined && candidate.operatingStatus !== undefined;
    const place = projectVoicePlace(complete ? candidate : (await ex.query(ex.queries.detail(candidate.id))).data, candidate.id);
    const distance = candidate.distanceMeters;
    if (distance !== undefined && (typeof distance !== 'number' || !Number.isFinite(distance) || distance < 0)) return invalid();
    places.push(Object.freeze({ ...place, ...(distance !== undefined ? { distanceMeters: distance } : {}) }));
  }
  const provenance = metadata(ex, places.map(p => p.id), { queryKey: list.queryKey, dataUpdatedAt: list.dataUpdatedAt });
  ex.commit.push(() => ex.provenance.recordPlaces(provenance));
  return Object.freeze({ places: Object.freeze(places), coverage: 'nearest_places' });
};
const searchNearby: VoiceCommandHandler<'searchNearbyReservablePlaces'> = async (request, ex) => {
  const a = request.args, r = ex.runtime;
  const range = voiceTimeRange(a.date, r.timezone, r.now(), a.startTime, a.endTime);
  const list = await ex.query(ex.queries.list({ latitude: r.location!.latitude, longitude: r.location!.longitude, radiusKm: r.radiusKm,
    page: 1, limit: NEARBY_RESERVATION_CANDIDATE_LIMIT, sort: 'NEAREST', ...(a.touristCategory ? { touristCategory: a.touristCategory } : {}) }));
  if (!list.data || !Array.isArray(list.data.places)) return invalid();
  const candidates = list.data.places.slice(0, NEARBY_RESERVATION_CANDIDATE_LIMIT);
  const seen = new Set<number>();
  const places: VoicePlaceFacts[] = [];
  for (const candidate of candidates) {
    ex.check();
    if (!candidate || !validId(candidate.id) || seen.has(candidate.id)) return invalid();
    seen.add(candidate.id);
    const availability = await ex.query(ex.queries.availability(candidate.id));
    const eligible = slots(availability.data, candidate.id, a.quantity, range, r.now());
    if (!eligible.some(s => isSelectableAvailability(s as AvailabilityList[number]))) continue;
    const complete = candidate.name !== undefined && candidate.address !== undefined && candidate.touristCategories !== undefined && candidate.operatingStatus !== undefined;
    places.push(projectVoicePlace(complete ? candidate : (await ex.query(ex.queries.detail(candidate.id))).data, candidate.id));
  }
  const provenance = metadata(ex, places.map(p => p.id), { queryKey: list.queryKey, dataUpdatedAt: list.dataUpdatedAt });
  ex.commit.push(() => ex.provenance.recordPlaces(provenance));
  return Object.freeze({ places: Object.freeze(places), coverage: 'bounded_candidates' });
};
const getDetails: VoiceCommandHandler<'getPlaceDetails'> = async (request, ex) => {
  const result = await ex.query(ex.queries.detail(request.args.placeId));
  const place = projectVoicePlace(result.data, request.args.placeId);
  const provenance = metadata(ex, [place.id], { queryKey: result.queryKey, dataUpdatedAt: result.dataUpdatedAt });
  ex.commit.push(() => ex.provenance.recordVerifiedPlace(provenance));
  return Object.freeze({ place });
};
const getAvailability: VoiceCommandHandler<'getAvailabilities'> = async (request, ex) => {
  const { placeId, date, quantity } = request.args;
  const range = voiceTimeRange(date, ex.runtime.timezone, ex.runtime.now());
  const result = await ex.query(ex.queries.availability(placeId));
  const availabilities = Object.freeze(slots(result.data, placeId, quantity, range, ex.runtime.now()));
  const provenance = Object.freeze({ ...metadata(ex, [placeId], { queryKey: result.queryKey, dataUpdatedAt: result.dataUpdatedAt }),
    placeId, date, quantity, availabilityIds: Object.freeze(availabilities.map(s => s.id)), slots: availabilities });
  ex.commit.push(() => ex.provenance.recordAvailability(provenance));
  return Object.freeze({ placeId, date, quantity, availabilities });
};
const noValidation = () => {};
function requireAvailability(request: Request<'prepareReservation'>, ex: Execution) {
  requirePlace(request, ex);
  const p = ex.provenance.availability();
  if (!p || !matchingScope(p, ex)) throw new VoiceCommandError('STALE_CONTEXT');
  if (p.placeId !== request.args.placeId || !p.availabilityIds.includes(request.args.availabilityId)) {
    throw new VoiceCommandError('ID_NOT_IN_CONTEXT');
  }
  if (p.quantity !== request.args.quantity) throw new VoiceCommandError('STALE_CONTEXT');
}
const prepareReservation: VoiceCommandHandler<'prepareReservation'> = async (request, ex) => {
  const p = ex.provenance.availability()!;
  const { placeId, availabilityId, quantity } = request.args;
  const selected = p.slots.find(s => s.id === availabilityId)!;
  // Re-read canonical data; never construct a draft from cached/stale selection alone.
  ex.force = true;
  const result = await ex.query(ex.queries.availability(placeId));
  const range = voiceTimeRange(p.date, ex.runtime.timezone, ex.runtime.now());
  const fresh = slots(result.data, placeId, quantity, range, ex.runtime.now()).find(s => s.id === availabilityId);
  if (!fresh || serverInstant(fresh.startsAt) <= ex.runtime.now()) throw new VoiceCommandError('AVAILABILITY_UNAVAILABLE');
  if (!areServerInstantsEqual(fresh.startsAt, selected.startsAt) || !areServerInstantsEqual(fresh.endsAt, selected.endsAt)) {
    throw new VoiceCommandError('STALE_CONTEXT');
  }
  const place = projectVoicePlace((await ex.query(ex.queries.detail(placeId))).data, placeId);
  const quote = await ex.query(ex.queries.quote(placeId, availabilityId, quantity, ex.scope.accountRevision));
  const draft = prepareVoiceReservationDraft(quote.data, { place, availability: fresh, quantity, date: p.date,
    timezone: ex.runtime.timezone, availabilityDataUpdatedAt: result.dataUpdatedAt }, ex.runtime.now());
  ex.commit.push(() => ex.provenance.clearAvailability()); // A second preparation needs a fresh displayed selection.
  return Object.freeze({ draft });
};
const getMyReservations: VoiceCommandHandler<'getMyReservations'> = async (_request, ex) => {
  ex.force = true;
  const options = ex.queries.reservations({ page: 1, limit: 100 });
  // Account-scoped, fresh reads; never reuse another signed-in user's list.
  const query = await ex.query({ ...options, queryKey: [...options.queryKey, ex.scope.accountRevision] });
  if (!query.data || !Array.isArray(query.data.reservations)) return invalid();
  const reservations: VoiceCommandOutput['getMyReservations']['reservations'][number][] = [];
  let incomplete = false;
  for (const reservation of query.data.reservations) {
    if (!reservation || !validId(reservation.id)) return invalid();
    if (reservation.status !== 'CONFIRMED' && reservation.status !== 'PENDING') continue;
    const confirmation = reservation.confirmation;
    // Missing legacy snapshots cannot establish which place a reservation owns.
    if (!confirmation || !validId(confirmation.placeId) || typeof confirmation.placeName !== 'string'
      || !confirmation.placeName.trim()) { incomplete = true; continue; }
    const startsAt = reservation.reservationStartsAt ?? confirmation.startsAt;
    const endsAt = reservation.reservationEndsAt ?? confirmation.endsAt;
    const start = serverInstant(startsAt), end = serverInstant(endsAt);
    if (end <= start) return invalid();
    if (end <= ex.runtime.now()) continue;
    reservations.push(Object.freeze({ reservationId: reservation.id, placeId: confirmation.placeId,
      placeName: confirmation.placeName, startsAt, endsAt, status: reservation.status }));
  }
  const verified = metadata(ex, reservations.map(item => item.placeId), query);
  ex.commit.push(() => ex.provenance.recordPlaces(verified));
  return Object.freeze({ reservations: Object.freeze(reservations), hasMore: incomplete || query.data.hasNext === true
    || query.data.reservations.length >= 100 || (query.data.totalElements ?? 0) > query.data.reservations.length });
};
const navigateToPage: VoiceCommandHandler<'navigateToPage'> = async (request, ex) => {
  const { page, placeId } = request.args;
  if (!ex.runtime.navigateToPage) throw new VoiceCommandError('FORBIDDEN');
  let target: VoiceNavigationTarget;
  if (page === 'placeDetail' || page === 'createReservation' || page === 'directions') {
    if (placeId === undefined) throw new VoiceClarification('placeId');
    requirePlace({ args: { placeId } }, ex);
    ex.force = true;
    // Re-read canonical detail before dispatch, including stale selected/search context.
    const detail = (await ex.query(ex.queries.detail(placeId))).data;
    projectVoicePlace(detail, placeId);
    if (page === 'directions' && (!Number.isFinite(detail.latitude) || Math.abs(detail.latitude!) > 90
      || !Number.isFinite(detail.longitude) || Math.abs(detail.longitude!) > 180)) throw new VoiceCommandError('NOT_FOUND');
    target = Object.freeze({ page, placeId });
  } else if (page === 'communityPost') {
    ex.force = true;
    const feed = (await ex.query(ex.queries.posts({ page: 1, limit: 1 }))).data;
    if (!feed || !Array.isArray(feed.posts)) return invalid();
    if (feed.posts.length === 0) throw new VoiceCommandError('NOT_FOUND');
    const postId = feed.posts[0]?.postId;
    if (!validId(postId)) return invalid();
    const post = (await ex.query(ex.queries.post(postId))).data;
    if (!post || post.postId !== postId) return invalid();
    target = Object.freeze({ page, postId });
  } else target = Object.freeze({ page });
  ex.check();
  // Dispatch only at the final synchronous commit, after all generation/account checks.
  ex.commit.push(() => {
    if (!ex.runtime.navigateToPage!(target)) throw new VoiceCommandError('FORBIDDEN');
  });
  return Object.freeze({ target, navigationRequested: true });
};
export const VOICE_COMMAND_REGISTRY = Object.freeze({
  getMyReservations: Object.freeze({ name: 'getMyReservations', policy: VOICE_COMMAND_POLICIES.getMyReservations, validate: noValidation, handler: getMyReservations }),
  searchNearbyPlaces: Object.freeze({ name: 'searchNearbyPlaces', policy: VOICE_COMMAND_POLICIES.searchNearbyPlaces, validate: validateSearch, handler: searchNearbyPlaces }),
  searchNearbyReservablePlaces: Object.freeze({ name: 'searchNearbyReservablePlaces', policy: VOICE_COMMAND_POLICIES.searchNearbyReservablePlaces, validate: validateSearch, handler: searchNearby }),
  getPlaceDetails: Object.freeze({ name: 'getPlaceDetails', policy: VOICE_COMMAND_POLICIES.getPlaceDetails, validate: requirePlace, handler: getDetails }),
  getAvailabilities: Object.freeze({ name: 'getAvailabilities', policy: VOICE_COMMAND_POLICIES.getAvailabilities, validate: requirePlace, handler: getAvailability }),
  updateReservationBooker: Object.freeze({ name: 'updateReservationBooker', policy: VOICE_COMMAND_POLICIES.updateReservationBooker, validate: requirePlace,
    handler: async (request: Request<'updateReservationBooker'>) => {
      const { placeId, ...fields } = request.args;
      return Object.freeze({ placeId, fields: Object.freeze(fields) });
    } }),
  prepareReservation: Object.freeze({ name: 'prepareReservation', policy: VOICE_COMMAND_POLICIES.prepareReservation, validate: requireAvailability, handler: prepareReservation }),
  navigateToPage: Object.freeze({ name: 'navigateToPage', policy: VOICE_COMMAND_POLICIES.navigateToPage, validate: noValidation, handler: navigateToPage }),
  cancelVoiceSession: Object.freeze({ name: 'cancelVoiceSession', policy: VOICE_COMMAND_POLICIES.cancelVoiceSession, validate: noValidation,
    handler: async () => Object.freeze({ sessionStopped: true as const }) }),
} satisfies Registry);

function safeError(error: unknown, command?: VoiceCommandName): CommandFailureCode {
  if (error instanceof VoiceCommandError) return error.code;
  if (error instanceof VoiceSessionError && error.code === 'REPLAY_CONFLICT') return 'REPLAY_CONFLICT';
  if (error instanceof ApiError) {
    if (error.code === 'QUOTE_TERMS_UNAVAILABLE') return 'QUOTE_TERMS_UNAVAILABLE';
    if (['QUOTE_EXPIRED', 'QUOTE_CONDITIONS_CHANGED', 'QUOTE_REQUEST_MISMATCH'].includes(error.code ?? '')) return 'STALE_CONTEXT';
    if (['RESERVATION_SLOT_NOT_FOUND', 'RESERVATION_SLOT_INACTIVE', 'RESERVATION_CAPACITY_EXCEEDED'].includes(error.code ?? '')) return 'AVAILABILITY_UNAVAILABLE';
    if (error.code === 'RESERVATION_PRODUCT_UNAVAILABLE') return 'UNSUPPORTED_PRODUCT';
    if (error.code === 'ERR_CANCELED') return 'CANCELED';
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'TIMEOUT';
    if (error.status === 401) return 'AUTHENTICATION_REQUIRED';
    if (error.status === 403) return 'FORBIDDEN';
    // A failed collection route is not proof that a searched place does not exist.
    if (error.status === 404) return command === 'searchNearbyPlaces' || command === 'searchNearbyReservablePlaces'
      ? 'INVALID_SERVER_RESPONSE' : 'NOT_FOUND';
    if (error.status === 429) return 'RATE_LIMITED';
    if (error.status && error.status >= 500) return 'SERVER_ERROR';
    if (error.isNetworkError) return 'NETWORK_ERROR';
  }
  return 'INVALID_SERVER_RESPONSE';
}
let resultSequence = 0; // Module-lifetime IDs: no provider-controlled component, no resets between sessions.
/** Install ONLY as #347's consumer: its atomic ledger owns delivery and replay, including retries. */
export function createVoiceCommandDispatcher(options: {
  runtime: () => VoiceCommandRuntime; publish: (result: AppCommandResult) => void;
  stopSession: () => void | Promise<void>; queries?: Partial<Queries>;
}) {
  const provenance = createVoiceProvenance(() => options.runtime().monotonic());
  const pending = new Set<AbortController>();
  let conditionRevision = 0;
  function clear() { pending.forEach(c => c.abort()); pending.clear(); provenance.clear(); }
  const consume: VoiceEnvelopeConsumer = async (input, delivery: VoiceDeliveryContext) => {
    const parsed = parseVoiceAssistantEnvelope(input);
    if (!parsed.ok || parsed.value.kind !== 'command_request') return;
    const command = parsed.value;
    const initial = options.runtime();
    const controller = new AbortController(); pending.add(controller);
    let timedOut = false;
    const abort = () => controller.abort();
    delivery.signal.addEventListener('abort', abort, { once: true });
    if (delivery.signal.aborted) abort();
    const current = () => {
      const runtime = options.runtime();
      return delivery.isCurrent() && !delivery.signal.aborted && runtime.accountRevision !== null
        && runtime.accountRevision === initial.accountRevision && runtime.contextRevision === initial.contextRevision
        && runtime.timezone === initial.timezone && runtime.locationPermission === initial.locationPermission
        && runtime.radiusKm === initial.radiusKm && runtime.location?.latitude === initial.location?.latitude
        && runtime.location?.longitude === initial.location?.longitude
        && runtime.session?.epoch === delivery.epoch && runtime.session.generation === delivery.generation
        && runtime.session.sessionId === delivery.sessionId && delivery.envelopeId === command.id;
    };
    const check = () => {
      if (timedOut || performance.now() >= delivery.deadline) throw new VoiceCommandError('TIMEOUT');
      if (!current()) throw new VoiceCommandError('STALE_CONTEXT');
      if (controller.signal.aborted) throw new VoiceCommandError('CANCELED');
    };
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, Math.max(0, delivery.deadline - performance.now()));
    const ex: Execution = {
      runtime: initial, scope: { sessionId: delivery.sessionId, epoch: delivery.epoch, generation: delivery.generation,
        accountRevision: initial.accountRevision ?? '', contextRevision: initial.contextRevision, conditionRevision },
      signal: controller.signal, provenance, queries: { ...voiceReadQueries, ...options.queries }, force: false, check, commit: [],
      query: async query => { check(); const result = await observeVoiceQuery(initial.queryClient, query, controller.signal, ex.force); check(); return result; },
    };
    try {
      check();
      if (!delivery.claimExecution(command)) return;
      // A failed replacement search/slot request must not leave the previous selection usable.
      if (command.command === 'searchNearbyReservablePlaces' || command.command === 'searchNearbyPlaces') {
        provenance.clear(); conditionRevision++;
        ex.scope = { ...ex.scope, conditionRevision };
      } else if (command.command === 'getAvailabilities') provenance.clearAvailability();
      const entry = VOICE_COMMAND_REGISTRY[command.command];
      // The mapped Registry statically correlates args/results. This erasure is local to dispatch.
      const invoke = entry as { policy: { allowsMutation: false }; validate: (c: CommandRequest, e: Execution) => void;
        handler: ((c: CommandRequest, e: Execution) => Promise<VoiceCommandOutput[VoiceCommandName]>) | null };
      if (invoke.policy.allowsMutation !== false || !invoke.handler) throw new VoiceCommandError('FORBIDDEN');
      // Explicit business names use the catalog keyword contract, not a nearby GPS query.
      const nameSearch = 'requiresRuntimeLocation' in entry.policy && entry.policy.requiresRuntimeLocation === 'unlessNameSearch'
        && command.command === 'searchNearbyPlaces' && command.args.matchSource === 'name';
      if (command.command !== 'navigateToPage' && command.command !== 'getMyReservations' && !nameSearch) requireLocation(initial);
      invoke.validate(command, ex);
      const data = await invoke.handler(command, ex);
      check();
      ex.commit.forEach(commit => commit());
      const result = Object.freeze({ schemaVersion: 1, kind: 'command_result', source: 'app', id: `app-result-${++resultSequence}`,
        commandId: command.id, command: command.command, outcome: Object.freeze({ status: 'succeeded', data }) }) as AppCommandResult;
      options.publish(result);
      if (command.command === 'cancelVoiceSession' && current()) { clear(); void options.stopSession(); }
    } catch (error) {
      if (command.command === 'prepareReservation' && current()) provenance.clearAvailability();
      if (current()) {
        const outcome = error instanceof VoiceClarification ? Object.freeze({ status: 'clarification_required' as const, field: error.field })
          : Object.freeze({ status: 'rejected' as const, code: timedOut ? 'TIMEOUT' as const : safeError(error, command.command) });
        options.publish(Object.freeze({ schemaVersion: 1, kind: 'command_result', source: 'app', id: `app-result-${++resultSequence}`,
          commandId: command.id, command: command.command, outcome }) as AppCommandResult);
      }
    } finally { clearTimeout(timer); delivery.signal.removeEventListener('abort', abort); pending.delete(controller); controller.abort(); }
  };
  return { consume, clear, provenance };
}
