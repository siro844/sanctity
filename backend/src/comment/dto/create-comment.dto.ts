import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  body!: string;              

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;       
}
