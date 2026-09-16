import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, MoreThanOrEqual, Repository } from "typeorm";
import { QrPlaque } from "../qr-plaques/entities/qr-plaque.entity";
import { PlaqueScan, PlaqueActivityType } from "./entities/plaque-scan.entity";

@Injectable()
export class PlaqueUserService {
  constructor(
    @InjectRepository(QrPlaque)
    private readonly plaqueRepository: Repository<QrPlaque>,
    @InjectRepository(PlaqueScan)
    private readonly scanRepository: Repository<PlaqueScan>,
  ) {}

  async recordScan(code: string) {
    const plaque = await this.plaqueRepository.findOne({
      where: [{ uniqueCode: code }, { code }],
    });
    if (!plaque) {
      throw new NotFoundException(`Plaque with code ${code} not found`);
    }

    const scan = this.scanRepository.create({
      plaqueId: plaque.id,
      plaqueName: plaque.name,
      type: PlaqueActivityType.SCAN,
      description: `Person scanned Plaque #${plaque.uniqueCode ?? plaque.code}`,
      source: "QR Code",
    });
    await this.scanRepository.save(scan);

    return {
      message: "Scan recorded",
      plaque: {
        id: plaque.id,
        name: plaque.name,
        uniqueCode: plaque.uniqueCode ?? plaque.code,
      },
    };
  }

  private async getOwnedPlaqueIds(userId: string): Promise<string[]> {
    const plaques = await this.plaqueRepository.find({
      where: { assignedBusiness: { id: userId } },
      select: ["id"],
    });
    return plaques.map((p) => p.id);
  }

  async getSummary(userId: string) {
    const plaqueIds = await this.getOwnedPlaqueIds(userId);
    if (plaqueIds.length === 0) {
      return { totalScans: 0, scans30d: 0, redemptions30d: 0, commissionEarned: 0 };
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalScans = await this.scanRepository.count({
      where: { plaqueId: In(plaqueIds) },
    });
    const scans30d = await this.scanRepository.count({
      where: { plaqueId: In(plaqueIds), scannedAt: MoreThanOrEqual(thirtyDaysAgo) },
    });
    const redemptions30d = await this.scanRepository.count({
      where: {
        plaqueId: In(plaqueIds),
        type: PlaqueActivityType.REDEMPTION,
        scannedAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    return {
      totalScans,
      scans30d,
      redemptions30d,
      commissionEarned: 0,
    };
  }

  async getPlaques(userId: string) {
    const plaques = await this.plaqueRepository.find({
      where: { assignedBusiness: { id: userId } },
    });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = [];
    for (const plaque of plaques) {
      const scans30d = await this.scanRepository.count({
        where: { plaqueId: plaque.id, scannedAt: MoreThanOrEqual(thirtyDaysAgo) },
      });
      results.push({
        id: plaque.id,
        name: plaque.name,
        status: plaque.status,
        location: plaque.footerText || plaque.description || "",
        scans30d,
      });
    }
    return results;
  }

  async getActivities(userId: string) {
    const plaqueIds = await this.getOwnedPlaqueIds(userId);
    if (plaqueIds.length === 0) {
      return [];
    }

    const scans = await this.scanRepository.find({
      where: { plaqueId: In(plaqueIds) },
      order: { scannedAt: "DESC" },
      take: 50,
    });

    return scans.map((scan) => ({
      id: scan.id,
      type: scan.type,
      description: scan.description,
      source: scan.source,
      scannedAt: scan.scannedAt,
    }));
  }
}