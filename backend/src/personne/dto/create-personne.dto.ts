import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';

export enum TypeLogement {
  locataire = 'locataire',
  proprietaire = 'proprietaire',
  heberge = 'heberge',
}

export enum Role {
  candidat = 'candidat',
  co_candidat = 'co_candidat',
  garant = 'garant',
}

export class CreatePersonneDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  revenus?: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsEnum(TypeLogement)
  typeLogement: TypeLogement;

  @IsString()
  statutId: string;
}
