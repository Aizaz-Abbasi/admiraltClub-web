import { API_ENDPOINTS, apiClient, apiGet, Location, LocationsResponse } from "../api";

export async function fetchLocations(): Promise<Location[]> {
    const response = await apiGet<LocationsResponse>(API_ENDPOINTS.locations.list);
    return response.locations ?? [];
  }

export interface UpdateLocationPayload {
  name?: string;
  address?: string;
}

export interface CreateLocationPayload {
  name: string;
  address: string;
}

type UpdateLocationResponse =
  | { success: boolean; location: Location }
  | { success: boolean; data: Location }
  | Location;

type CreateLocationResponse =
  | { success: boolean; location: Location }
  | { success: boolean; data: Location }
  | Location;

export async function updateLocation(id: number, payload: UpdateLocationPayload): Promise<Location> {
  console.log("updateLocation", id, payload);
  
    const response = await apiClient.put<UpdateLocationResponse>(API_ENDPOINTS.locations.update(id.toString()), payload);
  const data = response.data;
console.log("data", data);
  if ('location' in (data as any) && (data as any).location) {
    return (data as any).location as Location;
  }

  if ('data' in (data as any) && (data as any).data) {
    return (data as any).data as Location;
  }

  return data as Location;
}

export async function createLocation(payload: CreateLocationPayload): Promise<Location> {
  const response = await apiClient.post<CreateLocationResponse>(API_ENDPOINTS.locations.create, payload);
  const data = response.data;

  if ('location' in (data as any) && (data as any).location) {
    return (data as any).location as Location;
  }

  if ('data' in (data as any) && (data as any).data) {
    return (data as any).data as Location;
  }

  return data as Location;
}