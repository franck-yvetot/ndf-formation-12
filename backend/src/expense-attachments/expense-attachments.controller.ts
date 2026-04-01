import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ExpenseAttachmentsService } from './expense-attachments.service';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { AttachmentListResponseDto } from './dto/attachment-list-response.dto';
import { createMulterOptions } from './multer/multer-config.factory';

@ApiTags('Expense Attachments')
@Controller('expense-reports/:reportId/expenses/:expenseId/attachments')
export class ExpenseAttachmentsController {
  constructor(private readonly service: ExpenseAttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', createMulterOptions()))
  @ApiOperation({ summary: 'Upload a file attachment for an expense' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (PDF or image). Max 50MB.',
        },
      },
    },
  })
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiResponse({ status: 201, type: AttachmentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeded' })
  @ApiResponse({ status: 404, description: 'Expense or report not found' })
  async uploadAttachment(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.service.uploadAttachment(reportId, expenseId, file);
  }

  @Get()
  @ApiOperation({ summary: 'List all attachments for an expense' })
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiResponse({ status: 200, type: AttachmentListResponseDto })
  async findAll(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
  ): Promise<AttachmentListResponseDto> {
    return this.service.findAll(reportId, expenseId);
  }

  @Get(':attachmentId')
  @ApiOperation({ summary: 'Get a single attachment metadata' })
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiParam({ name: 'attachmentId', type: String })
  @ApiResponse({ status: 200, type: AttachmentResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<AttachmentResponseDto> {
    return this.service.findOne(reportId, expenseId, attachmentId);
  }

  @Delete(':attachmentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an attachment (removes the file from disk)' })
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiParam({ name: 'attachmentId', type: String })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<void> {
    return this.service.remove(reportId, expenseId, attachmentId);
  }

  @Get(':attachmentId/download')
  @ApiOperation({ summary: 'Download an attachment file' })
  @ApiParam({ name: 'reportId', type: String })
  @ApiParam({ name: 'expenseId', type: String })
  @ApiParam({ name: 'attachmentId', type: String })
  @ApiResponse({ status: 200, description: 'File binary stream' })
  @ApiResponse({ status: 404 })
  async download(
    @Param('reportId') reportId: string,
    @Param('expenseId') expenseId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const attachment = await this.service.findOne(
      reportId,
      expenseId,
      attachmentId,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${attachment.originalName}"`,
    );
    res.setHeader('Content-Type', attachment.mimeType);
    res.sendFile(attachment.storagePath);
  }
}
