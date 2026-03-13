import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('lng') lng: string, @Query('lat') lat: string) {
    if (!lng || !lat) {
      throw new Error('Missing lng or lat parameter');
    }

    return this.weatherService.getWeather(lng, lat);
  }

  @Get('detail')
  async getWeatherDetail(@Query('lng') lng: string, @Query('lat') lat: string) {
    if (!lng || !lat) {
      throw new Error('Missing lng or lat parameter');
    }

    return this.weatherService.getWeatherDetail(lng, lat);
  }
}
