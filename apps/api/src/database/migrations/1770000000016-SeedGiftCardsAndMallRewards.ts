import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedGiftCardsAndMallRewards1770000000016 implements MigrationInterface {
  name = "SeedGiftCardsAndMallRewards1770000000016";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert actual gift cards into the reward table if they don't already exist
    await queryRunner.query(`
      INSERT INTO "reward" (
        "id", "created_at", "updated_at", "title", "description", "image", "value",
        "max_points", "reward_type", "reward_source", "audience", "status",
        "quantity", "is_points_enabled", "is_stamps_enabled", "disabled"
      ) VALUES
      (
        'a1000000-0000-0000-0000-000000000001',
        now(), now(),
        'Amazon eGift Card',
        'Redeemable towards millions of items store-wide on Amazon. Delivered instantly to your MCOM digital wallet.',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
        50,
        500,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000002',
        now(), now(),
        'Starbucks Card',
        'Enjoy premium coffees, handcrafted espresso beverages, fresh pastries, and snacks at any Starbucks location.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        25,
        250,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000003',
        now(), now(),
        'Sephora Beauty Card',
        'Explore the best in prestige cosmetics, skincare, fragrance, and haircare from top global beauty brands.',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        30,
        300,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000004',
        now(), now(),
        'Netflix Subscription Card',
        'Watch your favorite TV shows, movies, documentaries, and exclusive Netflix Originals on any device.',
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
        20,
        200,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000005',
        now(), now(),
        'Nike Digital Gift Card',
        'Unlock the best of Nike performance sportswear, iconic footwear, and lifestyle apparel on Nike.com.',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        60,
        600,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000006',
        now(), now(),
        'Apple Gift Card',
        'Products, accessories, apps, games, music, movies, TV shows, and iCloud storage all in one card.',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        100,
        1000,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000007',
        now(), now(),
        'Uber & Uber Eats Card',
        'One card for rides and delicious food deliveries from thousands of top local restaurants right to your door.',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
        25,
        250,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      ),
      (
        'a1000000-0000-0000-0000-000000000008',
        now(), now(),
        'ASOS Fashion Gift Card',
        'Discover the latest fashion trends and over 850 of the world’s best clothing and beauty brands.',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
        40,
        400,
        'gift card',
        'mcom vault',
        'all business',
        'active',
        1000,
        true,
        false,
        false
      )
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Also link the first available business to these gift cards in business_reward with mall_reward_type = 'GIFT_CARD'
    await queryRunner.query(`
      INSERT INTO "business_reward" (
        "id", "created_at", "updated_at", "title", "description", "image",
        "points_required", "reward_type", "reward_source", "audience", "status",
        "is_points_enabled", "is_stamps_enabled", "is_mall_integrated", "mall_reward_type",
        "mall_reward_value", "business_id", "reward_id"
      )
      SELECT
        uuid_generate_v4(),
        now(),
        now(),
        r.title,
        r.description,
        r.image,
        r.max_points,
        'gift card',
        'business',
        'all business',
        'active',
        true,
        false,
        true,
        'GIFT_CARD',
        r.value,
        b.id,
        r.id
      FROM "reward" r
      CROSS JOIN (SELECT id FROM "businesses" LIMIT 1) b
      WHERE r.id IN (
        'a1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000006',
        'a1000000-0000-0000-0000-000000000007',
        'a1000000-0000-0000-0000-000000000008'
      )
      AND NOT EXISTS (
        SELECT 1 FROM "business_reward" br WHERE br.reward_id = r.id
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "business_reward" WHERE "reward_id" IN (
        'a1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000006',
        'a1000000-0000-0000-0000-000000000007',
        'a1000000-0000-0000-0000-000000000008'
      );
    `);
    await queryRunner.query(`
      DELETE FROM "reward" WHERE "id" IN (
        'a1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000006',
        'a1000000-0000-0000-0000-000000000007',
        'a1000000-0000-0000-0000-000000000008'
      );
    `);
  }
}
