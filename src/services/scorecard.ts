import { API_ENDPOINTS, apiGet, apiPost, apiPatch, apiDelete } from "../api";

export interface Scorecard {
  id: number;
  score: number;
  datePlayed: string;
  createdAt: string;
  course: { id: number; name: string };
  user?: { id: number; name: string; email: string };
}

interface ScorecardsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  scorecards: Scorecard[];
}

export async function fetchAllScores(status: string) {
  const url = `scorecards?page=1&limit=100`;
  const response = await apiGet<ScorecardsResponse>(url);
  return response.scorecards || [];
}

export async function createScore(data: {
  courseId: number;
  score: number;
  datePlayed?: string;
}) {
  const response = await apiPost<{ success: boolean; scorecard: Scorecard }>(
    "scorecards",
    data,
  );
  return response.scorecard;
}

export async function adminCreateScore(data: {
  userId: number;
  courseId: number;
  score: number;
  datePlayed?: string;
}) {
  const response = await apiPost<{ success: boolean; scorecard: Scorecard }>(
    "scorecards/admin",
    data,
  );
  return response.scorecard;
}

export async function updateScore(
  id: number,
  data: { score?: number; datePlayed?: string },
) {
  const response = await apiPatch<{ success: boolean; scorecard: Scorecard }>(
    `scorecards/${id}`,
    data,
  );
  return response.scorecard;
}

export async function deleteScore(id: number) {
  return apiDelete<{ success: boolean; message: string }>(`scorecards/${id}`);
}
