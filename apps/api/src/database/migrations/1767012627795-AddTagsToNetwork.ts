import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Duplicate of AddTagsToNetwork1767012420291 (same statements, different
 * timestamp). Both cannot run against a fresh database because the first one
 * already creates the enum types and columns. Existing databases recorded both
 * as applied, so this one is kept as a no-op to preserve migration history.
 */
export class AddTagsToNetwork1767012627795 implements MigrationInterface {
  name = "AddTagsToNetwork1767012627795";

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // superseded by AddTagsToNetwork1767012420291
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // nothing to revert
  }
}
