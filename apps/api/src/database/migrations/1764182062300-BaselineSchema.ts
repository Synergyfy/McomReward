import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline schema.
 *
 * The original project schema was created outside of TypeORM migrations
 * (synchronize / an earlier codebase), so every migration from
 * 1764182062301 onward assumed these tables and enum types already existed.
 * Without this baseline the chain cannot run on an empty database.
 *
 * Generated from a database that had the full migration chain applied and
 * then had every migration reverted. Do not edit: add a new migration instead.
 */
export class BaselineSchema1764182062300 implements MigrationInterface {
  name = "BaselineSchema1764182062300";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."admins_role_enum" AS ENUM('Admin', 'Business', 'Participant', 'Partner', 'Staff')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_campaigns_audience_type_enum" AS ENUM('all', 'members', 'badge_level', 'target_wishlist')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_campaigns_campaign_type_enum" AS ENUM('qr_code', 'referral', 'social_or_email', 'special_occasion')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_campaigns_reward_type_enum" AS ENUM('regular', 'matching', 'both')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_reward_audience_enum" AS ENUM('all business', 'specific sectors', 'specific tiers')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_reward_reward_source_enum" AS ENUM('mcom vault', 'partner', 'business')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_reward_reward_type_enum" AS ENUM('Voucher', 'gift card', 'coupon', 'point offer', 'physical product', 'MallDiscount')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."business_reward_status_enum" AS ENUM('active', 'draft')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."businesses_role_enum" AS ENUM('Admin', 'Business', 'Participant', 'Partner', 'Staff')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."campaigns_audience_type_enum" AS ENUM('all', 'members', 'badge_level', 'target_wishlist')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."campaigns_campaign_type_enum" AS ENUM('qr_code', 'referral', 'social_or_email', 'special_occasion')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."campaigns_reward_type_enum" AS ENUM('regular', 'matching', 'both')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."coupon_discount_type_enum" AS ENUM('percentage', 'fixed_amount')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."deals_status_enum" AS ENUM('approved', 'declined', 'pending', 'flagged')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."matching_point_history_activitytype_enum" AS ENUM('CAMPAIGN_CREATION', 'REFER_BUSINESS', 'MEMBERSHIP_PAYMENT', 'MANUAL_ADJUSTMENT')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."participants_role_enum" AS ENUM('Admin', 'Business', 'Participant', 'Partner', 'Staff')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."payment_history_payment_provider_enum" AS ENUM('stripe', 'paypal')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."payment_history_status_enum" AS ENUM('succeeded', 'failed', 'pending')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."plan_payments_paymentmethod_enum" AS ENUM('mcom_wallet', 'stripe', 'paypal')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."plan_subscriptions_payment_provider_enum" AS ENUM('stripe', 'paypal')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."plan_subscriptions_plan_type_enum" AS ENUM('monthly', 'annual', 'quarterly', 'seasonal')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."plan_subscriptions_status_enum" AS ENUM('active', 'inactive', 'expired')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."point_histories_type_enum" AS ENUM('EARN', 'REDEEM', 'MATCHING')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."qr_plaques_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'FOR_SALE', 'PENDING_ASSIGNMENT')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."referrals_status_enum" AS ENUM('PENDING', 'SUCCESSFUL')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."reward_audience_enum" AS ENUM('all business', 'specific sectors', 'specific tiers')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."reward_reward_source_enum" AS ENUM('mcom vault', 'partner', 'business')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."reward_reward_type_enum" AS ENUM('Voucher', 'gift card', 'coupon', 'point offer', 'physical product', 'MallDiscount')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."reward_status_enum" AS ENUM('active', 'draft')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."staff_role_enum" AS ENUM('Admin', 'Business', 'Participant', 'Partner', 'Staff')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."tier_history_status_enum" AS ENUM('published', 'draft')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."tier_status_enum" AS ENUM('published', 'draft')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."transaction_codes_status_enum" AS ENUM('ACTIVE', 'USED', 'EXPIRED')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."transaction_codes_type_enum" AS ENUM('EARN', 'REDEEM', 'STAMP_EARN')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."membership_status_enum" AS ENUM('active', 'inactive', 'expired')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."membership_plantype_enum" AS ENUM('monthly', 'annual', 'quarterly', 'seasonal')`,
    );

    await queryRunner.query(`CREATE TABLE "membership" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP,
    "user_id" character varying NOT NULL,
    "user_type" character varying NOT NULL,
    "plan_type" "public"."membership_plantype_enum" NOT NULL DEFAULT 'monthly',
    "start_date" TIMESTAMP,
    "end_date" TIMESTAMP,
    "status" "public"."membership_status_enum" NOT NULL DEFAULT 'active',
    CONSTRAINT "PK_membership" PRIMARY KEY ("id")
  )`);

    await queryRunner.query(`CREATE TABLE public.abstract_base_entity (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);`);

    await queryRunner.query(`CREATE TABLE public.admins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    "firstName" character varying,
    "lastName" character varying,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.admins_role_enum DEFAULT 'Admin'::public.admins_role_enum NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.business_campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    disabled boolean DEFAULT false NOT NULL,
    "uniqueCode" character varying,
    name character varying,
    campaign_type public.business_campaigns_campaign_type_enum DEFAULT 'qr_code'::public.business_campaigns_campaign_type_enum NOT NULL,
    campaign_message character varying,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    audience_type public.business_campaigns_audience_type_enum DEFAULT 'all'::public.business_campaigns_audience_type_enum NOT NULL,
    banner_url character varying,
    logo_url character varying,
    "signUpPoint" integer DEFAULT 0 NOT NULL,
    regular_points_threshold integer,
    total_points_earned integer DEFAULT 0 NOT NULL,
    total_points_redeemed integer DEFAULT 0 NOT NULL,
    earn_point_page_title character varying,
    earn_point_page_description character varying,
    redeem_reward_page_title character varying,
    redeem_reward_page_description character varying,
    contact_us_page_title character varying,
    contact_us_page_description character varying,
    contact_email character varying,
    contact_phone_number character varying,
    footer_text character varying,
    business_id uuid,
    campaign_id uuid,
    matching_points_disabled_by_admin boolean DEFAULT false NOT NULL,
    total_matching_points_earned integer DEFAULT 0 NOT NULL,
    matching_points_threshold integer,
    reward_type public.business_campaigns_reward_type_enum DEFAULT 'regular'::public.business_campaigns_reward_type_enum NOT NULL,
    quantity integer NOT NULL,
    background_color character varying NOT NULL,
    text_color character varying NOT NULL,
    cta_text_color character varying NOT NULL,
    cta_background_color character varying NOT NULL,
    cta_text character varying NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.business_reward (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    quantity integer,
    "point_required" integer,
    title character varying NOT NULL,
    reward_type public.business_reward_reward_type_enum NOT NULL,
    reward_source public.business_reward_reward_source_enum DEFAULT 'business'::public.business_reward_reward_source_enum NOT NULL,
    audience public.business_reward_audience_enum DEFAULT 'all business'::public.business_reward_audience_enum NOT NULL,
    expiry_datetime timestamp without time zone,
    status public.business_reward_status_enum DEFAULT 'active'::public.business_reward_status_enum NOT NULL,
    description character varying NOT NULL,
    image character varying NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    business_id uuid,
    reward_id uuid,
    campaign_id uuid,
    value integer NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.businesses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    "firstName" character varying,
    "lastName" character varying,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    phone character varying,
    address character varying,
    website character varying,
    "socialMedia" jsonb,
    "uniqueCode" character varying NOT NULL,
    role public.businesses_role_enum DEFAULT 'Business'::public.businesses_role_enum NOT NULL,
    "affiliateCode" character varying,
    "referralPoints" numeric DEFAULT '0'::numeric NOT NULL,
    reputation_points numeric DEFAULT '0'::numeric NOT NULL,
    "isDisabled" boolean DEFAULT false NOT NULL,
    stripe_customer_id character varying,
    total_points_earned integer DEFAULT 0 NOT NULL,
    total_points_redeemed integer DEFAULT 0 NOT NULL,
    "sectorId" uuid,
    "categoryId" uuid,
    "subCategoryId" uuid,
    "referredById" uuid,
    "referralCapacity" integer,
    "matchingPointBalance" numeric DEFAULT '0'::numeric CONSTRAINT businesses_matching_points_not_null NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    campaign_type public.campaigns_campaign_type_enum DEFAULT 'qr_code'::public.campaigns_campaign_type_enum NOT NULL,
    campaign_message text NOT NULL,
    audience_type public.campaigns_audience_type_enum NOT NULL,
    banner_url character varying NOT NULL,
    logo_url character varying,
    disabled boolean DEFAULT false NOT NULL,
    "signUpPoint" integer,
    total_points_earned integer DEFAULT 0 NOT NULL,
    total_points_redeemed integer DEFAULT 0 NOT NULL,
    regular_points_threshold integer,
    "uniqueCode" character varying(9),
    earn_point_page_title character varying,
    earn_point_page_description text,
    redeem_reward_page_title character varying,
    redeem_reward_page_description text,
    contact_us_page_title character varying,
    contact_us_page_description text,
    contact_email character varying,
    contact_phone_number character varying,
    footer_text character varying,
    business_id uuid,
    matching_points_disabled_by_admin boolean DEFAULT false NOT NULL,
    total_matching_points_earned integer DEFAULT 0 NOT NULL,
    matching_points_threshold integer,
    reward_type public.campaigns_reward_type_enum DEFAULT 'regular'::public.campaigns_reward_type_enum NOT NULL,
    quantity integer NOT NULL,
    background_color character varying NOT NULL,
    text_color character varying NOT NULL,
    cta_text_color character varying NOT NULL,
    cta_background_color character varying NOT NULL,
    cta_text character varying NOT NULL,
    end_date timestamp without time zone NOT NULL,
    start_date timestamp without time zone NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.campaigns_rewards_reward (
    "campaignsId" uuid NOT NULL,
    "rewardId" uuid NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    "imageUrl" character varying,
    "sectorId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.coupon (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    code character varying NOT NULL,
    discount_type public.coupon_discount_type_enum NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.deals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    description text NOT NULL,
    "imageUrl" character varying,
    value numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    "termsAndConditions" text NOT NULL,
    status public.deals_status_enum DEFAULT 'pending'::public.deals_status_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "categoryId" uuid,
    "businessId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.matching_point_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    description character varying,
    "businessId" uuid NOT NULL,
    points numeric NOT NULL,
    "activityType" public.matching_point_history_activitytype_enum NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.otp (
    id integer NOT NULL,
    email character varying NOT NULL,
    otp character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.participant_campaign_balances (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    campaign_balance integer DEFAULT 0 NOT NULL,
    "participantId" uuid,
    "campaignId" uuid,
    "businessCampaignId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.participants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.participants_role_enum DEFAULT 'Participant'::public.participants_role_enum NOT NULL,
    "uniqueCode" character varying NOT NULL,
    global_total_points integer DEFAULT 0 NOT NULL,
    matching_points integer DEFAULT 0 NOT NULL,
    "isDisabled" boolean DEFAULT false NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.participants_business_campaigns_business_campaigns (
    "participantsId" uuid CONSTRAINT "participants_business_campaigns_busines_participantsId_not_null" NOT NULL,
    "businessCampaignsId" uuid CONSTRAINT "participants_business_campaigns_bu_businessCampaignsId_not_null" NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.participants_campaigns_campaigns (
    "participantsId" uuid NOT NULL,
    "campaignsId" uuid NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.partners (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    "businessName" character varying NOT NULL,
    email character varying NOT NULL,
    "phoneNumber" character varying NOT NULL,
    password character varying NOT NULL,
    sub_category_id uuid
);`);

    await queryRunner.query(`CREATE TABLE public.payment_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    user_type character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_provider public.payment_history_payment_provider_enum NOT NULL,
    transaction_id character varying NOT NULL,
    status public.payment_history_status_enum NOT NULL,
    "subscriptionId" uuid,
    user_id character varying NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.plan_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'GBP'::character varying NOT NULL,
    "paymentMethod" public.plan_payments_paymentmethod_enum NOT NULL,
    "transactionId" character varying NOT NULL,
    metadata jsonb,
    business_id uuid
);`);

    await queryRunner.query(`CREATE TABLE public.plan_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    plan_variant_id uuid,
    price_id uuid,
    status public.plan_subscriptions_status_enum DEFAULT 'inactive'::public.plan_subscriptions_status_enum NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    is_trial boolean DEFAULT false NOT NULL,
    trial_days integer,
    plan_type public.plan_subscriptions_plan_type_enum DEFAULT 'monthly'::public.plan_subscriptions_plan_type_enum NOT NULL,
    transaction_id character varying,
    payment_provider public.plan_subscriptions_payment_provider_enum,
    business_id uuid,
    payment_id uuid
);`);

    await queryRunner.query(`CREATE TABLE public.point_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    type public.point_histories_type_enum NOT NULL,
    points integer NOT NULL,
    redemption_code character varying,
    description character varying,
    participant_id uuid,
    campaign_id uuid,
    business_campaign_id uuid,
    reward_id uuid,
    business_reward_id uuid,
    initiated_by_staff_id uuid,
    business_id uuid
);`);

    await queryRunner.query(`CREATE TABLE public.qr_plaques (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    code character varying(9) NOT NULL,
    status public.qr_plaques_status_enum DEFAULT 'PENDING_ASSIGNMENT'::public.qr_plaques_status_enum NOT NULL,
    assigned_partner_id uuid,
    assigned_business_id uuid,
    "pendingInviteCode" character varying,
    "pendingInviteEmail" character varying,
    link character varying
);`);

    await queryRunner.query(`CREATE TABLE public.referrals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    status public.referrals_status_enum DEFAULT 'PENDING'::public.referrals_status_enum NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.reward (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    points_required integer,
    reward_type public.reward_reward_type_enum NOT NULL,
    audience public.reward_audience_enum NOT NULL,
    expiry_datetime timestamp without time zone,
    status public.reward_status_enum DEFAULT 'active'::public.reward_status_enum NOT NULL,
    value integer NOT NULL,
    description character varying NOT NULL,
    image character varying NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    disabled boolean DEFAULT false NOT NULL,
    reward_source public.reward_reward_source_enum NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.reward_tiers_tier (
    "rewardId" uuid NOT NULL,
    "tierId" uuid NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.sectors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    "imageUrl" character varying
);`);

    await queryRunner.query(`CREATE TABLE public.staff (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    "firstName" character varying,
    "lastName" character varying,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    avatar character varying,
    "uniqueCode" character varying NOT NULL,
    role public.staff_role_enum DEFAULT 'Staff'::public.staff_role_enum NOT NULL,
    "businessId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.subcategories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    "imageUrl" character varying,
    "categoryId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.tier (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    monthly_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    annual_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    quaterly_price numeric(10,2) DEFAULT '0'::numeric CONSTRAINT tier_quarterly_price_not_null NOT NULL,
    features text NOT NULL,
    status public.tier_status_enum DEFAULT 'draft'::public.tier_status_enum NOT NULL,
    stripe_monthly_price_id character varying,
    stripe_quarterly_price_id character varying,
    stripe_annual_price_id character varying,
    paypal_monthly_plan_id character varying,
    paypal_quarterly_plan_id character varying,
    paypal_annual_plan_id character varying,
    "qrCodeCount" integer DEFAULT 0 NOT NULL
);`);

    await queryRunner.query(`CREATE TABLE public.tier_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    monthly_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    annual_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    quaterly_price numeric(10,2) DEFAULT '0'::numeric CONSTRAINT tier_history_quarterly_price_not_null NOT NULL,
    features text NOT NULL,
    status public.tier_history_status_enum NOT NULL,
    "tierId" uuid NOT NULL,
    "adminId" uuid
);`);

    await queryRunner.query(`CREATE TABLE public.transaction_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    code character varying(9) NOT NULL,
    type public.transaction_codes_type_enum NOT NULL,
    status public.transaction_codes_status_enum DEFAULT 'ACTIVE'::public.transaction_codes_status_enum NOT NULL,
    points integer,
    expires_at timestamp without time zone NOT NULL,
    campaign_id uuid,
    business_campaign_id uuid,
    reward_id uuid,
    creator_business_id uuid,
    creator_staff_id uuid,
    used_by_participant_id uuid
);`);

    await queryRunner.query(
      `ALTER TABLE "deals" ALTER COLUMN "status" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "referrals" ALTER COLUMN "status" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "qr_plaques" ALTER COLUMN "status" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "point_histories" ALTER COLUMN "points" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_reward" ALTER COLUMN "reward_source" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_reward" ALTER COLUMN "audience" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_campaigns" ALTER COLUMN "audience_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_campaigns" ALTER COLUMN "audience_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_campaigns" ALTER COLUMN "signUpPoint" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_campaigns" ALTER COLUMN "campaign_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "campaign_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "staff" ALTER COLUMN "role" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "participants" ALTER COLUMN "role" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "businesses" ALTER COLUMN "role" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "role" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "business_campaigns" ALTER COLUMN "campaign_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "campaign_type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "businesses" ADD COLUMN "postalCode" character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "referrals" ADD COLUMN "referredId" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "referrals" ADD COLUMN "referrerId" uuid`,
    );

    await queryRunner.query(`CREATE SEQUENCE public.otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;`);

    await queryRunner.query(
      `ALTER SEQUENCE public.otp_id_seq OWNED BY public.otp.id;`,
    );

    await queryRunner.query(
      `ALTER TABLE ONLY public.otp ALTER COLUMN id SET DEFAULT nextval('public.otp_id_seq'::regclass);`,
    );

    await queryRunner.query(`ALTER TABLE ONLY public.tier
    ADD CONSTRAINT "PK_14d67ceef0dbea040e39e97e7f6" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.reward_tiers_tier
    ADD CONSTRAINT "PK_17e3a6e7c5a5e70f3290ecf8c5b" PRIMARY KEY ("rewardId", "tierId");`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants
    ADD CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_payments
    ADD CONSTRAINT "PK_1f6093e9f04098203db33b76c82" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.participant_campaign_balances
    ADD CONSTRAINT "PK_21757c41eb9a07973c3ef913579" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.otp
    ADD CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "PK_397ae7a736f6fd86b76cf87f786" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_reward
    ADD CONSTRAINT "PK_5221ba21e4f0c0effe7f241dc94" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT "PK_5fcec51a769b65c0c3c0987f11c" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.abstract_base_entity
    ADD CONSTRAINT "PK_723c213727b1038d476972ce2f2" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT "PK_793ef34ad0a3f86f09d4837007c" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT "PK_7c3ba15fba216647ec723cca3c8" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "PK_8c66f03b250f613ff8615940b4b" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.partners
    ADD CONSTRAINT "PK_998645b20820e4ab99aeae03b41" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.qr_plaques
    ADD CONSTRAINT "PK_a279cf01a5753cb3a1b10d62466" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.matching_point_history
    ADD CONSTRAINT "PK_a613a0b64ccda46fe1eefea90cd" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.reward
    ADD CONSTRAINT "PK_a90ea606c229e380fb341838036" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_campaigns
    ADD CONSTRAINT "PK_b578c96dc41c94fb5e535dac6d6" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns_rewards_reward
    ADD CONSTRAINT "PK_c844f50819f9ec83af9f20ff21e" PRIMARY KEY ("campaignsId", "rewardId");`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants_business_campaigns_business_campaigns
    ADD CONSTRAINT "PK_c9eb56a6924570090c913783a22" PRIMARY KEY ("participantsId", "businessCampaignsId");`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "PK_e01b99df91c8b4e471723fbe8bc" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants_campaigns_campaigns
    ADD CONSTRAINT "PK_f5f09626763cb5f4daee0602024" PRIMARY KEY ("participantsId", "campaignsId");`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_subscriptions
    ADD CONSTRAINT "PK_fbecd15ea78b4de498d0b0b4b00" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.coupon
    ADD CONSTRAINT "PK_fcbe9d72b60eed35f46dc35a682" PRIMARY KEY (id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_subscriptions
    ADD CONSTRAINT "REL_088111d5724fbe58cb9851129c" UNIQUE (payment_id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE (email);`);

    await queryRunner.query(`ALTER TABLE ONLY public.qr_plaques
    ADD CONSTRAINT "UQ_0b8ff9b2316f23cd23a9b34f04f" UNIQUE (code);`);

    await queryRunner.query(`ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "UQ_105ca73f710d5031c9217d8ddb0" UNIQUE ("uniqueCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT "UQ_1a10b192342e5165948f4dccefc" UNIQUE (name);`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "UQ_1cfbce819ad69ab704da2e8f679" UNIQUE ("uniqueCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "UQ_53dea0dc091588e475dc939cf7e" UNIQUE ("affiliateCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "UQ_54797a9dde39b6f49f9ea781d48" UNIQUE (code);`);

    await queryRunner.query(`ALTER TABLE ONLY public.coupon
    ADD CONSTRAINT "UQ_62d3c5b0ce63a82c48e86d904bc" UNIQUE (code);`);

    await queryRunner.query(`ALTER TABLE ONLY public.partners
    ADD CONSTRAINT "UQ_6b39bc13ab676e74eada2e744db" UNIQUE (email);`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_campaigns
    ADD CONSTRAINT "UQ_6fa61e2a94543c1efa5b2572a21" UNIQUE ("uniqueCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE (name);`);

    await queryRunner.query(`ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "UQ_902985a964245652d5e3a0f5f6a" UNIQUE (email);`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_payments
    ADD CONSTRAINT "UQ_967b8e164e56b97fed29754c5e4" UNIQUE ("transactionId");`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "UQ_9cb927bc21d77173501a2a6e77f" UNIQUE ("uniqueCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants
    ADD CONSTRAINT "UQ_a0306d02da30d7f11388817ff53" UNIQUE ("uniqueCode");`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants
    ADD CONSTRAINT "UQ_b77ad0832a0f8ec526c1f40a842" UNIQUE (email);`);

    await queryRunner.query(`ALTER TABLE ONLY public.tier
    ADD CONSTRAINT "UQ_ca31b25988ac3848aef318f9b8f" UNIQUE (name);`);

    await queryRunner.query(`ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT "UQ_d1a3a67c9c5d440edf414af1271" UNIQUE (name);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "UQ_ee58c14c74529ea227d8337ab69" UNIQUE (email);`);

    await queryRunner.query(
      `CREATE INDEX "IDX_053ab1c92cfc0a328e92f82e87" ON public.participants_business_campaigns_business_campaigns USING btree ("businessCampaignsId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_341b0aeda8506cb146d8a8f77a" ON public.participants_business_campaigns_business_campaigns USING btree ("participantsId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_4921ac664f44887c235e432c15" ON public.deals USING btree ("endDate");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_4f14f95c2bbcb0f16092bf8c29" ON public.reward_tiers_tier USING btree ("tierId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_60a571ba4a6e6fa0dcbe86810a" ON public.participants_campaigns_campaigns USING btree ("campaignsId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_689492a5950d6c323e052517bd" ON public.campaigns_rewards_reward USING btree ("rewardId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_d1d2954335af776cbd3d1159fa" ON public.reward_tiers_tier USING btree ("rewardId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_d80df1a09f6ab44f062633cdd6" ON public.participants_campaigns_campaigns USING btree ("participantsId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_e7601abcf8be36497d18008ca3" ON public.deals USING btree ("startDate");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_e857fb22408eb75cb909620c82" ON public.deals USING btree ("categoryId");`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_ee3ebc8dc0cb7db89a161ff7de" ON public.campaigns_rewards_reward USING btree ("campaignsId");`,
    );

    await queryRunner.query(`ALTER TABLE ONLY public.participants_business_campaigns_business_campaigns
    ADD CONSTRAINT "FK_053ab1c92cfc0a328e92f82e874" FOREIGN KEY ("businessCampaignsId") REFERENCES public.business_campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_subscriptions
    ADD CONSTRAINT "FK_088111d5724fbe58cb9851129ce" FOREIGN KEY (payment_id) REFERENCES public.plan_payments(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_13f39e65d897e5baf3e20002881" FOREIGN KEY (business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_payments
    ADD CONSTRAINT "FK_1e161c6be24279383e0fd2f7d7e" FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_23e6af93ec557e418be698f76e1" FOREIGN KEY (creator_business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_2cbe62c3d4bd3742cc69c8a6292" FOREIGN KEY (business_reward_id) REFERENCES public.business_reward(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT "FK_3309cd631d6c3263c550d19ff19" FOREIGN KEY ("subscriptionId") REFERENCES public.plan_subscriptions(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants_business_campaigns_business_campaigns
    ADD CONSTRAINT "FK_341b0aeda8506cb146d8a8f77a9" FOREIGN KEY ("participantsId") REFERENCES public.participants(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.qr_plaques
    ADD CONSTRAINT "FK_420ae24d923d680ea13e2d15f1e" FOREIGN KEY (assigned_business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_45637c955ea9f3b39abaa0bd988" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_4649a63b4c7b4b67f5850f01536" FOREIGN KEY ("subCategoryId") REFERENCES public.subcategories(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_4d7c89efebdcbe7f54e92f5eed8" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.reward_tiers_tier
    ADD CONSTRAINT "FK_4f14f95c2bbcb0f16092bf8c293" FOREIGN KEY ("tierId") REFERENCES public.tier(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_campaigns
    ADD CONSTRAINT "FK_4f42693c124375f681c5c53e266" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_59a57aa18cacbc2b0f1d059595e" FOREIGN KEY (business_campaign_id) REFERENCES public.business_campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "FK_59d15502756ae86f87bd77f8058" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants_campaigns_campaigns
    ADD CONSTRAINT "FK_60a571ba4a6e6fa0dcbe86810a2" FOREIGN KEY ("campaignsId") REFERENCES public.campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_627775010550aa1a217aa315147" FOREIGN KEY ("sectorId") REFERENCES public.sectors(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns_rewards_reward
    ADD CONSTRAINT "FK_689492a5950d6c323e052517bd4" FOREIGN KEY ("rewardId") REFERENCES public.reward(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.plan_subscriptions
    ADD CONSTRAINT "FK_6b93de09b3d6db7b4cb780b6662" FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "FK_778013f0785179c0d7ea5c279ea" FOREIGN KEY (business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_77e4139c430a847f043eefbb083" FOREIGN KEY (used_by_participant_id) REFERENCES public.participants(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_79999a4ba2f2df35350fed2fcb7" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.participant_campaign_balances
    ADD CONSTRAINT "FK_80752009171233e4826fb5fac16" FOREIGN KEY ("participantId") REFERENCES public.participants(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT "FK_80d276c41e0647fc93d476e098b" FOREIGN KEY ("tierId") REFERENCES public.tier(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_8961857a8508048a2071ef1a4a9" FOREIGN KEY (business_campaign_id) REFERENCES public.business_campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_8c571a883646799d298a14a7b20" FOREIGN KEY (initiated_by_staff_id) REFERENCES public.staff(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_reward
    ADD CONSTRAINT "FK_8d6cfb538e98a3afe1da81e3773" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_97177eca63723272db0babf2187" FOREIGN KEY ("businessId") REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_97bbb9a44105d486f4c01720470" FOREIGN KEY (participant_id) REFERENCES public.participants(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_9baa04abbcadc6fecce820196ca" FOREIGN KEY (reward_id) REFERENCES public.reward(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.tier_history
    ADD CONSTRAINT "FK_a5902aeca1428d1e8bef428cb61" FOREIGN KEY ("adminId") REFERENCES public.admins(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.point_histories
    ADD CONSTRAINT "FK_ab3bee053d9855e2b894e9a73d2" FOREIGN KEY (reward_id) REFERENCES public.reward(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_reward
    ADD CONSTRAINT "FK_bff96c06701eaffad6be1350ba7" FOREIGN KEY (business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_c0b0310a0390cf980e513e148f2" FOREIGN KEY ("sectorId") REFERENCES public.sectors(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.matching_point_history
    ADD CONSTRAINT "FK_c0b86b300fd834cfa908baad165" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.qr_plaques
    ADD CONSTRAINT "FK_cb5f025f1e1f0666b0331b2e4cf" FOREIGN KEY (assigned_partner_id) REFERENCES public.partners(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT "FK_ce517997707ee28014759b1826b" FOREIGN KEY ("referredById") REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.reward_tiers_tier
    ADD CONSTRAINT "FK_d1d2954335af776cbd3d1159fa4" FOREIGN KEY ("rewardId") REFERENCES public.reward(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT "FK_d1fe096726c3c5b8a500950e448" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.participants_campaigns_campaigns
    ADD CONSTRAINT "FK_d80df1a09f6ab44f062633cdd60" FOREIGN KEY ("participantsId") REFERENCES public.participants(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_campaigns
    ADD CONSTRAINT "FK_dd183c4b474944d8cd7d74c54d6" FOREIGN KEY (business_id) REFERENCES public.businesses(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "FK_e857fb22408eb75cb909620c82e" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.campaigns_rewards_reward
    ADD CONSTRAINT "FK_ee3ebc8dc0cb7db89a161ff7dec" FOREIGN KEY ("campaignsId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;`);

    await queryRunner.query(`ALTER TABLE ONLY public.business_reward
    ADD CONSTRAINT "FK_ee9e5d0d67eefab80bb506f99fb" FOREIGN KEY (reward_id) REFERENCES public.reward(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.transaction_codes
    ADD CONSTRAINT "FK_f6a2d3214a4775f24b6464d4a64" FOREIGN KEY (creator_staff_id) REFERENCES public.staff(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.partners
    ADD CONSTRAINT "FK_f73b55d0a51e8c73f394364d85d" FOREIGN KEY (sub_category_id) REFERENCES public.subcategories(id);`);

    await queryRunner.query(`ALTER TABLE ONLY public.participant_campaign_balances
    ADD CONSTRAINT "FK_f86328f9b6c8517b36649558040" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id);`);

    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_59de462f9ce130da142e3b5a9f4" FOREIGN KEY ("referrerId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_ad6772c3fcb57375f43114b5cb5" FOREIGN KEY ("referredId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "participant_campaign_balances" ADD CONSTRAINT "FK_8a615ddc1d1994d3da708a0ea9f" FOREIGN KEY ("businessCampaignId") REFERENCES "business_campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "membership" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction_codes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tier_history" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tier" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subcategories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sectors" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reward_tiers_tier" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reward" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "referrals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "qr_plaques" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "point_histories" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "plan_subscriptions" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_history" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partners" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "participants_campaigns_campaigns" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "participants_business_campaigns_business_campaigns" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "participants" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "participant_campaign_balances" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "otp" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "matching_point_history" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "deals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "campaigns_rewards_reward" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "businesses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "business_reward" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "business_campaigns" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "admins" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "abstract_base_entity" CASCADE`,
    );
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "otp_id_seq" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_plantype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."membership_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."transaction_codes_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."transaction_codes_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tier_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."tier_history_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."staff_role_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_reward_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_reward_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."reward_audience_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."referrals_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."qr_plaques_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."point_histories_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_subscriptions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_subscriptions_plan_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_subscriptions_payment_provider_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."plan_payments_paymentmethod_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_history_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_history_payment_provider_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."participants_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."matching_point_history_activitytype_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."deals_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."coupon_discount_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."campaigns_reward_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."campaigns_campaign_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."campaigns_audience_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."businesses_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_reward_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_reward_reward_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_reward_reward_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_reward_audience_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_campaigns_reward_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_campaigns_campaign_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."business_campaigns_audience_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."admins_role_enum"`);
  }
}
