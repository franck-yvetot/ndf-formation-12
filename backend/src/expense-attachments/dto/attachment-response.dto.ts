import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  expenseId!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty()
  extension!: string;

  @ApiProperty({
    description: 'Public URL to access the file, e.g. /uploads/filename.pdf',
  })
  url!: string;

  @ApiProperty()
  createdAt!: Date;
}
