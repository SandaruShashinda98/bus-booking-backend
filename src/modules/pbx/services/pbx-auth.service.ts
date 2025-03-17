import { API_ENDPOINTS } from '@constant/pbx/api-endpoints';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { env } from 'process';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PbxAuthService {
  private readonly clientId = env.PBX_CLIENT_ID;
  private readonly clientSecret = env.PBX_CLIENT_SECRET;
  private readonly baseUrl = env.PBX_BASE_URL;

  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private httpService: HttpService) {}

  /**
   * Retrieves the current access token. If the current token is expired,
   * this method will obtain a new access token and return it.
   * @returns {Promise<string>} The current access token.
   */
  async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    } else {
      return await this.getNewAccessToken();
    }
  }

  /**
   * Obtains a new access token using the client_id and client_secret. This
   * method will return the new token and also update the internal state of
   * the service with the new token and its expiration time.
   * @returns {Promise<string>} The new access token.
   */
  async getNewAccessToken(): Promise<string> {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
    };

    const url = `${this.baseUrl}${API_ENDPOINTS.TOKEN}`;
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data.toString(), { headers }),
      );

      if (response.data) {
        this.token = response.data.access_token;
        this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      }

      return this.token;
    } catch (error) {
      throw new Error(`Failed to retrieve token: ${error.message}`);
    }
  }
}
