import { API_ENDPOINTS, apiClient, apiGet, Simulator } from '../api';

export interface SimulatorsResponse {
  success?: boolean;
  simulators?: Simulator[];
  data?: Simulator[];
}

export async function fetchSimulators(): Promise<Simulator[]> {
  const response = await apiGet<SimulatorsResponse | Simulator[]>(API_ENDPOINTS.simulators.list);

  if (Array.isArray(response)) {
    return response;
  }

  return response.simulators || response.data || [];
}

export interface CreateSimulatorPayload {
  name: string;
  locationId: string;
  status: Simulator['status'];
}

export interface UpdateSimulatorPayload {
  name?: string;
  locationId?: string;
  status?: Simulator['status'];
}

type SimulatorSingleResponse =
  | { success?: boolean; simulator?: Simulator }
  | { success?: boolean; data?: Simulator }
  | Simulator;

function unwrapSimulator(data: SimulatorSingleResponse): Simulator {
  if (typeof data === 'object' && data) {
    const anyData = data as any;
    if (anyData.simulator) return anyData.simulator as Simulator;
    if (anyData.data) return anyData.data as Simulator;
  }
  return data as Simulator;
}

export async function createSimulator(payload: CreateSimulatorPayload): Promise<Simulator> {
  const response = await apiClient.post<SimulatorSingleResponse>(API_ENDPOINTS.simulators.create, payload);
  return unwrapSimulator(response.data);
}

export async function updateSimulator(id: number, payload: UpdateSimulatorPayload): Promise<Simulator> {
  const response = await apiClient.put<SimulatorSingleResponse>(API_ENDPOINTS.simulators.update(`${id}`), payload);
  return unwrapSimulator(response.data);
}

