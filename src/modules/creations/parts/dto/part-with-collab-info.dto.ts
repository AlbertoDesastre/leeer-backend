import { Part } from '../entities/part.entity';

export class PartWithCollabInfoDto extends Part {
  isCollaboration: boolean;
  isOriginal: boolean;
}
