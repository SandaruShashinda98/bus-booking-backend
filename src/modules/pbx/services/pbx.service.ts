import { HttpException, Injectable } from '@nestjs/common';
import { PbxAuthService } from './pbx-auth.service';
import { HttpService } from '@nestjs/axios';
import { env } from 'process';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PbxService {
  private readonly baseUrl = env.PBX_BASE_URL;
  constructor(
    private readonly pbxAuthService: PbxAuthService,
    private readonly httpService: HttpService,
  ) {}

  async makeAPICall(method: string, endpoint: string, data: any) {
    const token = await this.pbxAuthService.getAccessToken();

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.baseUrl}${endpoint}`,
          data,
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }
}
