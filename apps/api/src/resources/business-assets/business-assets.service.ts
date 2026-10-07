import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../business/entities/business.entity";
import {
  LibraryAsset,
  LibraryAssetOwnerType,
} from "../library-assets/entities/library-asset.entity";
import { QrPlaque, QrPlaqueStatus } from "../qr-plaques/entities/qr-plaque.entity";
import { NfcCard, NfcCardStatus } from "./entities/nfc-card.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { GroupCircle } from "../group-circle/entities/group-circle.entity";
import { GroupCircleMember } from "../group-circle/entities/group-circle-member.entity";
import { PlaqueSale } from "../plaque-sales/entities/plaque-sale.entity";
import { PayoutRequest } from "../financials/entities/payout-request.entity";

@Injectable()
export class BusinessAssetsService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(LibraryAsset)
    private readonly libraryAssetRepository: Repository<LibraryAsset>,
    @InjectRepository(QrPlaque)
    private readonly qrPlaqueRepository: Repository<QrPlaque>,
    @InjectRepository(NfcCard)
    private readonly nfcCardRepository: Repository<NfcCard>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(GroupCircle)
    private readonly groupCircleRepository: Repository<GroupCircle>,
    @InjectRepository(GroupCircleMember)
    private readonly groupCircleMemberRepository: Repository<GroupCircleMember>,
    @InjectRepository(PlaqueSale)
    private readonly plaqueSaleRepository: Repository<PlaqueSale>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRequestRepository: Repository<PayoutRequest>,
  ) {}

  private async requireBusiness(businessId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  /** GET /business/storefront-media — profile media + owned gallery assets. */
  async getStorefrontMedia(businessId: string) {
    const business = await this.requireBusiness(businessId);
    const assets = await this.libraryAssetRepository.find({
      where: { businessId, ownerType: LibraryAssetOwnerType.BUSINESS },
      order: { created_at: "DESC" },
      take: 20,
    });
    const images = assets.filter((a) => a.type === "IMAGE");
    const videos = assets.filter((a) => a.type === "VIDEO");
    const firstVideo = videos[0];
    const firstImage = images[0];
    return {
      storefrontVideo: {
        url: firstVideo?.url ?? "",
        thumbnail: firstImage?.url ?? business.banner ?? business.profile_image ?? "",
        analytics: { views: 0, watchTime: "0m 0s", conversions: 0 },
      },
      gallery: [
        ...(business.profile_image
          ? [{ type: "logo", url: business.profile_image, thumbnail: business.profile_image }]
          : []),
        ...(business.banner
          ? [{ type: "image", url: business.banner, thumbnail: business.banner }]
          : []),
        ...assets.map((a) => ({
          type: a.type === "VIDEO" ? "video" : a.type === "DOCUMENT" ? "logo" : "image",
          url: a.url,
          thumbnail: a.url,
        })),
      ],
    };
  }

  /** GET /business/assets/overview — aggregated counts for the dashboard. */
  async getAssetOverview(businessId: string) {
    const business = await this.requireBusiness(businessId);

    const plaques = await this.qrPlaqueRepository
      .createQueryBuilder("p")
      .select("p.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("p.assigned_business_id = :businessId", { businessId })
      .groupBy("p.status")
      .getRawMany()
      .catch(() => []);
    const plaqueCount = (s: string) =>
      Number(plaques.find((r) => r.status === s)?.count ?? 0);
    const assigned = plaqueCount(QrPlaqueStatus.ASSIGNED);
    const active = plaqueCount(QrPlaqueStatus.ACTIVE);
    const allocated = plaques.reduce((n, r) => n + Number(r.count ?? 0), 0);

    const cards = await this.nfcCardRepository
      .createQueryBuilder("c")
      .select("c.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("c.business_id = :businessId", { businessId })
      .groupBy("c.status")
      .getRawMany()
      .catch(() => []);
    const cardCount = (s: string) =>
      Number(cards.find((r) => r.status === s)?.count ?? 0);

    const history = await this.pointHistoryRepository
      .createQueryBuilder("h")
      .select("COUNT(*)", "total")
      .where("h.business_id = :businessId", { businessId })
      .getRawOne()
      .catch(() => ({ total: 0 }));

    return {
      qrPlaques: {
        allocated,
        assigned,
        sold: assigned,
        active,
      },
      nfcCards: {
        issued: cards.reduce((n, r) => n + Number(r.count ?? 0), 0),
        active: cardCount(NfcCardStatus.ACTIVE),
        pending: cardCount(NfcCardStatus.PENDING),
      },
      scansAndRedemptions: {
        totalScans: Number(history?.total ?? 0),
        totalRedemptions: Number(business.total_points_redeemed ?? 0),
      },
      resaleRevenue: 0,
      groupSize: 0,
    };
  }

  /** GET /business/nfc-cards — cards issued to this business. */
  async getNfcCards(businessId: string) {
    await this.requireBusiness(businessId);
    const cards = await this.nfcCardRepository.find({
      where: { business: { id: businessId } },
      order: { created_at: "DESC" },
    });
    return {
      data: cards.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        tapCount: c.tapCount,
        linkedPage: c.linkedPage ?? null,
      })),
    };
  }

  /** GET /business/partner-network — circles + referred businesses. */
  async getPartnerNetwork(businessId: string) {
    const business = await this.requireBusiness(businessId);

    const circles = await this.groupCircleRepository.find({
      where: { business: { id: businessId } },
      relations: ["members", "members.network"],
      order: { created_at: "DESC" },
      take: 10,
    }).catch(() => []);

    const referred = await this.businessRepository.find({
      where: { referredBy: { id: businessId } },
      order: { created_at: "DESC" },
      take: 50,
    }).catch(() => []);

    let memberCount = 0;
    for (const c of circles) memberCount += c.members?.length ?? 0;

    const history = await this.pointHistoryRepository
      .createQueryBuilder("h")
      .select("COUNT(*)", "total")
      .where("h.business_id = :businessId", { businessId })
      .getRawOne()
      .catch(() => ({ total: 0 }));

    const partners = [
      ...referred.map((b) => ({
        id: b.id,
        name: b.name,
        role: "Member",
        status: "Active",
        joined: b.created_at ? new Date(b.created_at).toISOString().slice(0, 10) : null,
        commission: 0,
        scans: 0,
        redemptions: Number(b.total_points_redeemed ?? 0),
        plaques: 0,
      })),
      ...circles.flatMap((c) =>
        (c.members ?? []).map((m) => ({
          id: m.id,
          name: m.network?.businessName || m.network?.fullName || "Circle member",
          role: m.role ?? "Member",
          status: m.network?.isOnboarded ? "Active" : "Invited",
          joined: m.created_at ? new Date(m.created_at).toISOString().slice(0, 10) : null,
          commission: 0,
          scans: 0,
          redemptions: 0,
          plaques: 0,
        })),
      ),
    ];

    return {
      groupOverview: {
        name: circles[0]?.name ?? `${business.name} Network`,
        members: memberCount + referred.length,
        totalScans: Number(history?.total ?? 0),
        // No revenue-split concept exists in the data model yet.
        revenueSplit: "",
      },
      partners,
    };
  }

  /** GET /revenue/analytics — plaque sales + payouts for this business. */
  async getRevenueAnalytics(businessId: string) {
    await this.requireBusiness(businessId);

    const sales = await this.plaqueSaleRepository.find({
      where: [{ sellerId: businessId }, { buyerId: businessId }],
      order: { saleDate: "DESC" },
      take: 100,
    }).catch(() => []);

    const payouts = await this.payoutRequestRepository.find({
      where: { businessId },
      order: { requestedAt: "DESC" },
      take: 50,
    }).catch(() => []);

    const soldTotal = sales
      .filter((s) => s.sellerId === businessId)
      .reduce((n, s) => n + Number(s.salePrice ?? 0), 0);
    const commissionTotal = sales
      .filter((s) => s.sellerId === businessId)
      .reduce((n, s) => n + Number(s.commissionAmount ?? 0), 0);
    const pendingPayouts = payouts
      .filter((p) => String(p.status).toLowerCase() === "pending")
      .reduce((n, p) => n + Number(p.amount ?? 0), 0);

    const redeemCount = await this.pointHistoryRepository
      .createQueryBuilder("h")
      .select("COUNT(*)", "total")
      .where("h.business_id = :businessId", { businessId })
      .andWhere("h.type = :type", { type: "REDEEM" })
      .getRawOne()
      .catch(() => ({ total: 0 }));

    // Last 6 calendar months of seller revenue (real zeros for empty months).
    const months: { name: string; earnings: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-GB", { month: "short" });
      const monthSales = sales.filter((s) => {
        if (s.sellerId !== businessId || !s.saleDate) return false;
        const sd = new Date(s.saleDate);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
      });
      months.push({
        name: label,
        earnings: monthSales.reduce((n, s) => n + Number(s.salePrice ?? 0), 0),
      });
    }

    const transactions = [
      ...sales.slice(0, 20).map((s) => ({
        id: s.id,
        date: s.saleDate ? new Date(s.saleDate).toISOString().slice(0, 10) : "",
        type: s.sellerId === businessId ? "Plaque Sale" : "Plaque Purchase",
        amount: Number(s.salePrice ?? 0),
        status: s.status ?? "Completed",
      })),
      ...payouts.slice(0, 20).map((p) => ({
        id: p.id,
        date: p.requestedAt ? new Date(p.requestedAt).toISOString().slice(0, 10) : "",
        type: "Payout",
        amount: -Math.abs(Number(p.amount ?? 0)),
        status: String(p.status),
      })),
    ]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 20);

    return {
      overview: {
        plaqueSales: soldTotal,
        offerRedemptions: Number(redeemCount?.total ?? 0),
        commissions: commissionTotal,
        pendingPayouts,
      },
      earningsChart: months,
      transactions,
    };
  }

  /** GET /business/marketing-materials — owned docs/images + admin templates. */
  async getMarketingMaterials(businessId: string) {
    const business = await this.requireBusiness(businessId);
    const owned = await this.libraryAssetRepository.find({
      where: { businessId, ownerType: LibraryAssetOwnerType.BUSINESS },
      order: { created_at: "DESC" },
      take: 50,
    });
    const templates = await this.libraryAssetRepository.find({
      where: { ownerType: LibraryAssetOwnerType.ADMIN },
      order: { created_at: "DESC" },
      take: 20,
    }).catch(() => []);
    void business;
    const toItem = (a: LibraryAsset) => ({
      id: a.id,
      type: a.type === "DOCUMENT" ? "Flyer" : a.type === "VIDEO" ? "Video" : "Poster",
      title: a.title,
      format: a.type === "DOCUMENT" ? "PDF" : "PNG",
    });
    return { downloadCenter: [...owned, ...templates].map(toItem) };
  }
}
