import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { PaginatedExpensesResponseDto } from './dto/paginated-expenses-response.dto';

@ApiTags('Expenses')
@Controller('expense-reports/:reportId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiParam({ name: 'reportId', type: String })
  @ApiOperation({ summary: 'Create a new expense for a report' })
  @ApiResponse({ status: 201, type: ExpenseResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Report status prevents adding expenses',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  create(
    @Param('reportId') reportId: string,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(reportId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all expenses for a report' })
  @ApiResponse({ status: 200, type: PaginatedExpensesResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('reportId') reportId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedExpensesResponseDto> {
    return this.expensesService.findAll(
      reportId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':expenseId')
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiOperation({ summary: 'Get a specific expense by id' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(reportId, expenseId);
  }

  @Put(':expenseId')
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiOperation({ summary: 'Replace an expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Modification forbidden by status',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  replace(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(reportId, expenseId, dto);
  }

  @Patch(':expenseId')
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiOperation({ summary: 'Partially update an expense' })
  @ApiResponse({ status: 200, type: ExpenseResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Modification forbidden by status',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  update(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(reportId, expenseId, dto);
  }

  @Delete(':expenseId')
  @HttpCode(204)
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  remove(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
  ): Promise<void> {
    return this.expensesService.remove(reportId, expenseId);
  }
}
