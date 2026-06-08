import { IsArray, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTransmissionDto {
  @IsArray()
  @IsString({ each: true })
  documentTypeIds: string[];

  @IsOptional()
  @IsDateString()
  expireAt?: string;
}
