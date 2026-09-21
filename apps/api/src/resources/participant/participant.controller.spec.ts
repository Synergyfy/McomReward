import { Test, TestingModule } from "@nestjs/testing";
import { ParticipantController } from "./participant.controller";
import { ParticipantService } from "./participant.service";
import { RewardsService } from "../rewards/services/rewards.service";

describe("ParticipantController", () => {
  let controller: ParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: {},
        },
        {
          provide: RewardsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ParticipantController>(ParticipantController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
