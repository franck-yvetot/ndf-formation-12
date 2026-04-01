import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { unlink } from 'fs/promises';
import { ExpenseAttachment } from './entities/expense-attachment.entity';
import { ExpensesService } from '../expenses/expenses.service';
import { AttachmentListResponseDto } from './dto/attachment-list-response.dto';

@Injectable()
export class ExpenseAttachmentsService {
  constructor(
    @InjectRepository(ExpenseAttachment)
    private readonly attachmentRepository: Repository<ExpenseAttachment>,
    private readonly expensesService: ExpensesService,
  ) {}

  async uploadAttachment(
    reportId: string,
    expenseId: string,
    file: Express.Multer.File,
  ): Promise<ExpenseAttachment> {
    // Verify expense exists and belongs to the report
    await this.expensesService.findOne(reportId, expenseId);

    const url = `/uploads/${file.filename}`;

    const attachment = this.attachmentRepository.create({
      expenseId,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      extension: extname(file.originalname).toLowerCase(),
      storagePath: file.path,
      url,
    });

    return this.attachmentRepository.save(attachment);
  }

  async findAll(
    reportId: string,
    expenseId: string,
  ): Promise<AttachmentListResponseDto> {
    await this.expensesService.findOne(reportId, expenseId);

    const [data, total] = await this.attachmentRepository.findAndCount({
      where: { expenseId },
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(
    reportId: string,
    expenseId: string,
    attachmentId: string,
  ): Promise<ExpenseAttachment> {
    await this.expensesService.findOne(reportId, expenseId);

    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, expenseId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id "${attachmentId}" not found for expense "${expenseId}"`,
      );
    }

    return attachment;
  }

  async remove(
    reportId: string,
    expenseId: string,
    attachmentId: string,
  ): Promise<void> {
    const attachment = await this.findOne(reportId, expenseId, attachmentId);

    // Delete physical file, ignore if already absent
    await unlink(attachment.storagePath).catch(() => {
      /* ignore if file already absent */
    });

    await this.attachmentRepository.delete(attachmentId);
  }

  async getFilePath(
    reportId: string,
    expenseId: string,
    attachmentId: string,
  ): Promise<string> {
    const attachment = await this.findOne(reportId, expenseId, attachmentId);
    return attachment.storagePath;
  }
}
