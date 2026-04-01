import { ApiProperty } from '@nestjs/swagger';
import { AttachmentResponseDto } from './attachment-response.dto';

export class AttachmentListResponseDto {
  @ApiProperty({ type: [AttachmentResponseDto] })
  data!: AttachmentResponseDto[];

  @ApiProperty()
  total!: number;
}
