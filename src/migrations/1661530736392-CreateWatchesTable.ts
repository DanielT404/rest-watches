import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWatchesTable1661530736392 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'watches',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'model',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'bracelet_color',
            type: 'varchar',
            length: '25',
            isNullable: false
          },
          {
            name: 'launch_date_iso8601',
            type: 'date',
            isNullable: true
          },
          {
            name: 'price',
            type: 'numeric',
            isNullable: false,
            precision: 10,
            scale: 2
          },
          {
            name: 'price_currency_iso4217',
            type: 'char',
            isNullable: false,
            length: '3'
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
          }
        ]
      }),
      true,
      false,
      true
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_manuf_model_bracelet" ON watches (manufacturer, model, bracelet_color)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_manufacturer" ON watches (manufacturer)`
    );
    await queryRunner.query(`CREATE INDEX "idx_model" ON watches (model)`);
    await queryRunner.query(
      `CREATE INDEX "idx_bracelet_color" ON watches (bracelet_color)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_price_currency_iso4217" ON watches (price_currency_iso4217)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_manuf_model_bracelet"`);
    await queryRunner.query(`DROP INDEX "idx_manufacturer"`);
    await queryRunner.query(`DROP INDEX "idx_model"`);
    await queryRunner.query(`DROP INDEX "idx_bracelet_color"`);
    await queryRunner.query(`DROP INDEX "idx_price_currency_iso4217"`);
    await queryRunner.dropTable('watches', true);
  }
}
