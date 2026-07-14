import * as dotenv from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { Sector } from "./resources/sector/entities/sector.entity";
import { Category } from "./resources/category/entities/category.entity";
import { SubCategory } from "./resources/subcategory/entities/subcategory.entity";
import { Participant } from "./resources/participant/entities/participant.entity";
import { Role } from "./common/role.enum";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.prod"), override: true });

const dataSource = new DataSource({
  type: "postgres",
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USERNAME || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "dbname",
  host: process.env.POSTGRES_HOST || "localhost",
  entities: [
    Sector, Category, SubCategory, Participant,
    path.resolve(__dirname, "..") + "/src/**/*.entity{.ts,.js}",
  ],
  ssl: { rejectUnauthorized: false },
});

interface TaxonomySector {
  sector: string;
  categories: {
    name: string;
    subcategories: string[];
  }[];
}

const taxonomyData: TaxonomySector[] = [
  {
    sector: "Food & Beverage",
    categories: [
      {
        name: "Restaurants & Dining",
        subcategories: ["Fine Dining", "Fast Food", "Casual Dining", "Cafes & Bakeries", "Buffets"],
      },
      {
        name: "Specialty Food & Drink",
        subcategories: ["Desserts & Ice Cream", "Juice Bars & Smoothies", "Wineries & Breweries", "Tea Rooms"],
      },
    ],
  },
  {
    sector: "Retail & Shopping",
    categories: [
      {
        name: "Apparel & Fashion",
        subcategories: ["Men's Clothing", "Women's Clothing", "Kids & Baby Wear", "Footwear", "Accessories & Jewelry"],
      },
      {
        name: "Electronics & Gadgets",
        subcategories: ["Mobile Phones & Accessories", "Computers & Laptops", "Home Appliances", "Audio & Video"],
      },
      {
        name: "Home & Living",
        subcategories: ["Furniture", "Home Decor", "Kitchenware", "Bedding & Bath"],
      },
      {
        name: "Beauty & Personal Care",
        subcategories: ["Cosmetics", "Skincare", "Fragrances", "Hair Care Products"],
      },
    ],
  },
  {
    sector: "Health & Wellness",
    categories: [
      {
        name: "Fitness & Sports",
        subcategories: ["Gyms & Fitness Centers", "Yoga & Pilates Studios", "Sports Equipment", "Personal Training"],
      },
      {
        name: "Medical & Pharmacy",
        subcategories: ["Pharmacies", "Dental Clinics", "Opticians & Eyewear", "Chiropractic & Physical Therapy"],
      },
      {
        name: "Spa & Relaxation",
        subcategories: ["Massage Therapy", "Day Spas", "Wellness Retreats"],
      },
    ],
  },
  {
    sector: "Entertainment & Leisure",
    categories: [
      {
        name: "Amusements & Activities",
        subcategories: ["Movie Theaters", "Bowling Alleys", "Arcades & Gaming Zones", "Theme Parks"],
      },
      {
        name: "Arts & Culture",
        subcategories: ["Museum & Galleries", "Theaters & Concert Halls", "Music & Art Classes"],
      },
    ],
  },
  {
    sector: "Services",
    categories: [
      {
        name: "Automotive Services",
        subcategories: ["Car Wash & Detailing", "Auto Repair & Maintenance", "Tire Shops"],
      },
      {
        name: "Personal Services",
        subcategories: ["Hair Salons & Barbers", "Nail Salons", "Dry Cleaning & Laundry", "Pet Grooming"],
      },
    ],
  },
];

async function seedProd() {
  console.log("Initializing connection to prod database...");
  await dataSource.initialize();
  console.log("Connected!");

  try {
    const sectorRepo = dataSource.getRepository(Sector);
    const categoryRepo = dataSource.getRepository(Category);
    const subCategoryRepo = dataSource.getRepository(SubCategory);
    const participantRepo = dataSource.getRepository(Participant);

    console.log("Seeding sectors, categories, and subcategories...");

    for (const item of taxonomyData) {
      let sector = await sectorRepo.findOne({ where: { name: item.sector } });
      if (!sector) {
        sector = await sectorRepo.save({ name: item.sector });
        console.log(`Created Sector: ${item.sector}`);
      } else {
        console.log(`Sector already exists: ${item.sector}`);
      }

      for (const catItem of item.categories) {
        let category = await categoryRepo.findOne({
          where: { name: catItem.name },
          relations: ["sector"],
        });
        if (!category) {
          category = await categoryRepo.save({
            name: catItem.name,
            sector: sector,
          });
          console.log(`Created Category: ${catItem.name}`);
        } else {
          console.log(`Category already exists: ${catItem.name}`);
        }

        for (const subName of catItem.subcategories) {
          let subCategory = await subCategoryRepo.findOne({
            where: { name: subName },
            relations: ["category"],
          });
          if (!subCategory) {
            await subCategoryRepo.save({
              name: subName,
              category: category,
            });
            console.log(`Created Subcategory: ${subName}`);
          } else {
            console.log(`Subcategory already exists: ${subName}`);
          }
        }
      }
    }

    console.log("Seeding participant user...");
    const hashedPassword = await bcrypt.hash("password", 10);
    const userEmail = "user@example.com";
    let user = await participantRepo.findOne({ where: { email: userEmail } });
    if (!user) {
      await participantRepo.save({
        name: "Test User",
        email: userEmail,
        password: hashedPassword,
        role: Role.Participant,
        uniqueCode: nanoid(9),
      } as Participant);
      console.log(`Created user: ${userEmail} / password: password`);
    } else {
      console.log(`User already exists: ${userEmail}`);
    }

    console.log("Seeding plans (tiers)...");
    const tierRepo = dataSource.getRepository("Tier");

    const plans = [
      {
        name: "Bronze",
        type: "standard",
        color_code: "#CD7F32",
        monthly_price: 10,
        quarterly_price: 25,
        annual_price: 90,
        qrCodeCount: 5,
        status: "published",
        features: ["Basic analytics", "1 active campaign", "Up to 100 participants"],
        configuration: {
          quotas: {
            maxActiveCampaigns: 1,
            maxActiveRewards: 5,
            maxRewardsPerCampaign: 2,
            monthlyPointsAllowance: 500,
            monthlyStampsAllowance: 50,
            monthlyRewardBudget: 50,
            maxTeamMembers: 1,
            maxRewardPoints: 1000,
          },
          featureFlags: {
            canCreateCampaignFromScratch: true,
            canEditAdminTemplates: false,
            hasAccessToAdvancedAnalytics: false,
            hasAccessToCRM: false,
            canUpdateReward: true,
            canCreateRewardFromScratch: true,
          },
          trial: {
            quotas: {
              maxActiveCampaigns: 1,
              maxActiveRewards: 2,
            },
            featureFlags: {
              canCreateCampaignFromScratch: true,
            },
          },
        },
      },
      {
        name: "Silver",
        type: "standard",
        color_code: "#C0C0C0",
        monthly_price: 20,
        quarterly_price: 50,
        annual_price: 180,
        qrCodeCount: 15,
        status: "published",
        features: ["Advanced analytics", "5 active campaigns", "Up to 1000 participants", "CRM access"],
        configuration: {
          quotas: {
            maxActiveCampaigns: 5,
            maxActiveRewards: 10,
            maxRewardsPerCampaign: 3,
            monthlyPointsAllowance: 1000,
            monthlyStampsAllowance: 100,
            monthlyRewardBudget: 150,
            maxTeamMembers: 2,
            maxRewardPoints: 5000,
          },
          featureFlags: {
            canCreateCampaignFromScratch: true,
            canEditAdminTemplates: true,
            hasAccessToAdvancedAnalytics: true,
            hasAccessToCRM: true,
            canUpdateReward: true,
            canCreateRewardFromScratch: true,
          },
          progressBonuses: {
            active_campaign_bonus: 1,
          },
          pro: {
            conditions: {
              minCampaignsCreated: 2,
              minPointsUsed: 500,
            },
            benefits: {
              quotas: {
                maxActiveCampaigns: 6,
                maxRewardsPerCampaign: 4,
              },
              featureFlags: {
                canEditAdminTemplates: true,
              },
              bonusPoints: 500,
            },
          },
          pro_plus: {
            conditions: {
              minCampaignsCreated: 4,
              minCustomerInteractions: 80,
            },
            benefits: {
              quotas: {
                maxActiveCampaigns: 8,
                maxRewardsPerCampaign: 6,
              },
              featureFlags: {
                canCreateCampaignFromScratch: true,
              },
              unlockNextTierPreview: {
                percentNextTierPoints: 10,
                additionalTeamMembers: 1,
              },
            },
          },
          trial: {
            quotas: {
              maxActiveCampaigns: 2,
              maxActiveRewards: 5,
            },
            featureFlags: {
              canCreateCampaignFromScratch: false,
            },
          },
        },
      },
      {
        name: "Gold",
        type: "standard",
        color_code: "#FFD700",
        monthly_price: 30,
        quarterly_price: 75,
        annual_price: 270,
        qrCodeCount: -1,
        status: "published",
        features: ["Premium analytics", "Unlimited campaigns", "Unlimited participants", "CRM & API access", "Priority support"],
        configuration: {
          quotas: {
            maxActiveCampaigns: -1,
            maxActiveRewards: -1,
            maxRewardsPerCampaign: 10,
            monthlyPointsAllowance: 5000,
            monthlyStampsAllowance: 500,
            monthlyRewardBudget: 500,
            maxTeamMembers: 5,
            maxRewardPoints: -1,
          },
          featureFlags: {
            canCreateCampaignFromScratch: true,
            canEditAdminTemplates: true,
            hasAccessToAdvancedAnalytics: true,
            hasAccessToCRM: true,
            canUpdateReward: true,
            canCreateRewardFromScratch: true,
          },
          progressBonuses: {
            active_campaign_bonus: 3,
          },
          pro: {
            conditions: {
              minCampaignsCreated: 5,
              minPointsUsed: 2000,
            },
            benefits: {
              quotas: {
                maxActiveCampaigns: -1,
                maxRewardsPerCampaign: 15,
              },
              bonusPoints: 1000,
            },
          },
          pro_plus: {
            conditions: {
              minCampaignsCreated: 10,
              minCustomerInteractions: 200,
            },
            benefits: {
              quotas: {
                maxActiveCampaigns: -1,
                maxRewardsPerCampaign: 20,
              },
              unlockNextTierPreview: {
                percentNextTierPoints: 15,
                additionalTeamMembers: 2,
                analytics: true,
                segmentation: true,
              },
            },
          },
          trial: {
            quotas: {
              maxActiveCampaigns: 3,
              maxActiveRewards: 8,
            },
            featureFlags: {
              canCreateCampaignFromScratch: true,
            },
          },
        },
      },
    ];

    for (const plan of plans) {
      const existing = await tierRepo.findOne({ where: { name: plan.name } as any });
      if (!existing) {
        await tierRepo.save(plan as any);
        console.log(`Created plan: ${plan.name}`);
      } else {
        console.log(`Plan already exists: ${plan.name}`);
      }
    }

    console.log("Prod seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seedProd().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
