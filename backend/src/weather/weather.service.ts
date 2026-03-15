import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly axiosInstance = axios.create({
    timeout: 10000,
    family: 4, // 强制使用 IPv4
  });

  constructor(private configService: ConfigService) {}

  async getWeather(lng: string, lat: string) {
    const amapKey = this.configService.get<string>('AMAP_KEY');

    if (!amapKey) {
      throw new Error('AMAP_KEY not configured');
    }

    try {
      // 第一步：通过逆地理编码获取城市adcode
      const geoResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/geocode/regeo?key=${amapKey}&location=${lng},${lat}`,
      );
      const geoData = geoResponse.data;

      if (
        geoData.status !== '1' ||
        !geoData.regeocode?.addressComponent?.adcode
      ) {
        throw new Error('Failed to get city code from location');
      }

      const adcode = geoData.regeocode.addressComponent.adcode;

      // 第二步：获取实时天气
      const weatherResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=base`,
      );
      const weatherData = weatherResponse.data;

      // 第三步：获取天气预报（包含最高最低温）
      const forecastResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=all`,
      );
      const forecastData = forecastResponse.data;

      if (weatherData.status === '1' && weatherData.lives?.[0]) {
        const live = weatherData.lives[0];
        const forecast = forecastData.forecasts?.[0]?.casts?.[0];

        return {
          city: live.city,
          weather: live.weather,
          temperature: live.temperature,
          highTemp: forecast?.daytemp || live.temperature,
          lowTemp: forecast?.nighttemp || live.temperature,
          windDirection: live.winddirection,
          windPower: live.windpower,
          humidity: live.humidity,
          reportTime: live.reporttime,
        };
      }

      throw new Error('Failed to fetch weather data');
    } catch (error) {
      console.error('Weather service error details:', {
        isAxiosError: axios.isAxiosError(error),
        message: error instanceof Error ? error.message : 'Unknown',
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
        code: axios.isAxiosError(error) ? error.code : undefined,
      });

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          error.code ||
          'Axios request failed';
        throw new Error(`Weather API error: ${message}`);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Weather API error: ${message}`);
    }
  }

  async getWeatherDetail(lng: string, lat: string) {
    const amapKey = this.configService.get<string>('AMAP_KEY');

    if (!amapKey) {
      throw new Error('AMAP_KEY not configured');
    }

    try {
      // 第一步：通过逆地理编码获取城市adcode
      const geoResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/geocode/regeo?key=${amapKey}&location=${lng},${lat}`,
      );
      const geoData = geoResponse.data;

      if (
        geoData.status !== '1' ||
        !geoData.regeocode?.addressComponent?.adcode
      ) {
        throw new Error('Failed to get city code from location');
      }

      const adcode = geoData.regeocode.addressComponent.adcode;

      // 第二步：获取实时天气
      const weatherResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=base`,
      );
      const weatherData = weatherResponse.data;

      // 第三步：获取天气预报（未来几天）
      const forecastResponse = await this.axiosInstance.get(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=all`,
      );
      const forecastData = forecastResponse.data;

      if (weatherData.status === '1' && weatherData.lives?.[0]) {
        const live = weatherData.lives[0];
        const forecasts = forecastData.forecasts?.[0]?.casts || [];

        // 格式化预报数据
        const formattedForecast = forecasts.map((cast: any) => {
          const date = new Date(cast.date);
          const weekdays = [
            '周日',
            '周一',
            '周二',
            '周三',
            '周四',
            '周五',
            '周六',
          ];

          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            weekday: weekdays[date.getDay()],
            weather: cast.dayweather,
            highTemp: cast.daytemp,
            lowTemp: cast.nighttemp,
            windDirection: cast.daywind,
            windPower: cast.daypower,
          };
        });

        return {
          city: live.city,
          weather: live.weather,
          temperature: live.temperature,
          highTemp: forecasts[0]?.daytemp || live.temperature,
          lowTemp: forecasts[0]?.nighttemp || live.temperature,
          windDirection: live.winddirection,
          windPower: live.windpower,
          humidity: live.humidity,
          visibility: '10', // 高德API不提供能见度，使用默认值
          feelsLike: live.temperature, // 高德API不提供体感温度，使用实际温度
          updateTime: live.reporttime,
          forecast: formattedForecast,
        };
      }

      throw new Error('Failed to fetch weather data');
    } catch (error) {
      console.error('Weather detail service error:', error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          error.code ||
          'Axios request failed';
        throw new Error(`Weather API error: ${message}`);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Weather API error: ${message}`);
    }
  }
}
