import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../../business/entities/business.entity";
import { Participant } from "../../participant/entities/participant.entity";

export interface ResolvedRecipient {
  userId: string;
  userType: "Business" | "Participant";
  email: string;
  name?: string;
  mcomUserId?: string;
}

/**
 * Maps an external recipient (email + optional MCOM user id) to a local
 * mcom-rewards user. Tries the stable MCOM identity first, then email.
 */
@Injectable()
export class RecipientResolverService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async resolve(input: {
    email?: string;
    mcomUserId?: string;
  }): Promise<ResolvedRecipient | null> {
    const mcomUserId = input.mcomUserId?.trim();
    const email = input.email?.toLowerCase().trim();

    if (mcomUserId) {
      const participant = await this.participantRepository.findOne({
        where: { mcomUserId },
      });
      if (participant) return this.toParticipant(participant);

      const business = await this.businessRepository.findOne({
        where: { mcomUserId },
      });
      if (business) return this.toBusiness(business);
    }

    if (email) {
      const participant = await this.participantRepository.findOne({
        where: { email },
      });
      if (participant) return this.toParticipant(participant);

      const business = await this.businessRepository.findOne({
        where: { email },
      });
      if (business) return this.toBusiness(business);
    }

    return null;
  }

  private toParticipant(participant: Participant): ResolvedRecipient {
    return {
      userId: participant.id,
      userType: "Participant",
      email: participant.email,
      name: participant.name,
      mcomUserId: participant.mcomUserId,
    };
  }

  private toBusiness(business: Business): ResolvedRecipient {
    return {
      userId: business.id,
      userType: "Business",
      email: business.email,
      name: business.name,
      mcomUserId: business.mcomUserId,
    };
  }
}
