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
 * The full set of identifiers a partner may have used when issuing a reward to
 * a local user. Any of these should be treated as "the same user".
 */
export interface ResolvedIdentity {
  userId?: string;
  mcomUserId?: string;
  email?: string;
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

  /**
   * Resolve a logged-in local user (by id and/or email) into every identifier a
   * partner may have attached to an issuance: the local user id, the stable
   * MCOM Central user id, and the email.
   *
   * This is what lets a reward issued by a peer (e.g. FundOrDonate) against the
   * *central* user id still match the local account the user logs in with,
   * even when the local id or email differ.
   */
  async resolveIdentity(input: {
    userId?: string;
    email?: string;
  }): Promise<ResolvedIdentity> {
    if (input.userId) {
      const participant = await this.participantRepository.findOne({
        where: { id: input.userId },
      });
      if (participant) return this.identityFromParticipant(participant);

      const business = await this.businessRepository.findOne({
        where: { id: input.userId },
      });
      if (business) return this.identityFromBusiness(business);
    }

    const email = input.email?.toLowerCase().trim();
    if (email) {
      const participant = await this.participantRepository.findOne({
        where: { email },
      });
      if (participant) return this.identityFromParticipant(participant);

      const business = await this.businessRepository.findOne({
        where: { email },
      });
      if (business) return this.identityFromBusiness(business);
    }

    return { userId: input.userId, email };
  }

  private identityFromParticipant(participant: Participant): ResolvedIdentity {
    return {
      userId: participant.id,
      mcomUserId: participant.mcomUserId,
      email: participant.email?.toLowerCase().trim(),
    };
  }

  private identityFromBusiness(business: Business): ResolvedIdentity {
    return {
      userId: business.id,
      mcomUserId: business.mcomUserId,
      email: business.email?.toLowerCase().trim(),
    };
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
