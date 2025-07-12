import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiBody({ type: CreateBannerDto })
  @ApiResponse({ status: 201, description: 'Banner created successfully.' })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, description: 'List of banners.' })
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a banner by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Banner found.' })
  @ApiResponse({ status: 404, description: 'Banner not found.' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Banner not found.' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}
