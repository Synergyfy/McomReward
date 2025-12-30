import api from "@/services/api";

export interface SsoResponse {
  token: string;
  redirectUrl: string;
}

export const mallIntegrationService = {
  getSsoUrl: async (): Promise<SsoResponse> => {
    const response = await api.get("/mall-integration/sso-url");
    return response.data;
  },
};
