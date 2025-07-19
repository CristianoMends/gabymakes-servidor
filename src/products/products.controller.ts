import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  ValidationPipe,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';


@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) { }

  @Get('search')
  @ApiOperation({ summary: 'Buscar produtos com filtros' })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'priceMin', required: false })
  @ApiQuery({ name: 'priceMax', required: false })
  @ApiQuery({ name: 'quantityMin', required: false })
  @ApiQuery({ name: 'quantityMax', required: false })
  @ApiQuery({ name: 'isActive', required: false, enum: ['true', 'false'] })
  async findByFilters(@Query() query: any) {
    if (query.isActive !== undefined) {
      query.isActive = query.isActive === 'true';
    }
    return await this.productService.findByFilters(query);
  }

  @Get('categories/unique')
  @ApiOperation({ summary: 'Listar todas as categorias únicas de produtos' })
  async findUniqueCategories() {
    return await this.productService.findUniqueCategories();
  }

  @Get('brands/unique')
  @ApiOperation({ summary: 'Listar todas as marcas únicas de produtos' })
  async findUniqueBrands() {
    return await this.productService.findUniqueBrands();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um produto pelo ID' })
  @ApiParam({ name: 'id', type: 'string' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.productService.delete(id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo produto' })
  @ApiBody({ type: CreateProductDto })
  async create(@Body(new ValidationPipe()) dto: CreateProductDto) {
    return await this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  async findAll() {
    return (await this.productService.findAll()).filter(p => p.isActive);
  }
  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Obter produto por id' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,

  ) {
    return await this.productService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto pelo ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) dto: UpdateProductDto
  ) {
    return await this.productService.update(id, dto);
  }
}
