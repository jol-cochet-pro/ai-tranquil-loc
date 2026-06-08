import { IsArray, IsOptional, IsInt, Min, IsString } from 'class-validator';

export class CreateTransmissionDto {
  @IsArray()
  @IsString({ each: true })
  documentTypeIds: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  expireInDays?: number;
}
