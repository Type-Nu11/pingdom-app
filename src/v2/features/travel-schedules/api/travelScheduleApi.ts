import {
  apiClient,
  type ApiClient,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

export type CreateTravelScheduleBody = OperationRequestBody<'createTravelSchedule'>;
export type UpdateTravelScheduleBody = OperationRequestBody<'updateTravelSchedule'>;
export type TravelScheduleList = OperationResponse<'getTravelSchedules', 200>;
export type TravelSchedule = OperationResponse<'createTravelSchedule', 201>;

export function createTravelScheduleApi(client: ApiClient = apiClient) {
  return {
    cancelTravelSchedule: (
      scheduleId: number,
      signal?: AbortSignal,
    ): Promise<TravelSchedule> =>
      client.post<TravelSchedule>(
        `/users/me/travel-schedules/${scheduleId}/cancel`,
        undefined,
        { signal },
      ),

    createTravelSchedule: (
      body: CreateTravelScheduleBody,
      signal?: AbortSignal,
    ): Promise<TravelSchedule> =>
      client.post<TravelSchedule, CreateTravelScheduleBody>(
        '/users/me/travel-schedules',
        body,
        { signal },
      ),

    getTravelSchedules: (signal?: AbortSignal): Promise<TravelScheduleList> =>
      client.get<TravelScheduleList>('/users/me/travel-schedules', { signal }),

    updateTravelSchedule: (
      scheduleId: number,
      body: UpdateTravelScheduleBody,
      signal?: AbortSignal,
    ): Promise<TravelSchedule> =>
      client.patch<TravelSchedule, UpdateTravelScheduleBody>(
        `/users/me/travel-schedules/${scheduleId}`,
        body,
        { signal },
      ),
  };
}

export const travelScheduleApi = createTravelScheduleApi();
