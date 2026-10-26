import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "./mail.service";
import { EmailQueue, EmailQueueStatus } from "./entities/email-queue.entity";

export interface EnqueueEmailInput {
  to: string;
  subject: string;
  html?: string | null;
  text?: string | null;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Durable, database-backed email queue. No extra infrastructure is required,
 * and the worker is safe to run from every API instance because claiming a row
 * is an atomic conditional UPDATE.
 */
@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);
  private readonly batchSize = 25;
  private readonly maxAttempts = 5;
  private isProcessing = false;

  constructor(
    @InjectRepository(EmailQueue)
    private readonly queueRepository: Repository<EmailQueue>,
    private readonly mailService: MailService,
  ) {}

  async enqueue(input: EnqueueEmailInput): Promise<EmailQueue> {
    return this.queueRepository.save(
      this.queueRepository.create({
        to: input.to,
        subject: input.subject,
        html: input.html ?? null,
        text: input.text ?? null,
        status: EmailQueueStatus.PENDING,
        attempts: 0,
        maxAttempts: this.maxAttempts,
        lastError: null,
        scheduledAt: input.scheduledAt || new Date(),
        processedAt: null,
        sentAt: null,
        metadata: input.metadata ?? null,
      }),
    );
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: "email-queue-worker" })
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pending = await this.queueRepository.find({
        where: {
          status: EmailQueueStatus.PENDING,
          scheduledAt: LessThanOrEqual(new Date()),
        },
        order: { scheduledAt: "ASC", created_at: "ASC" },
        take: this.batchSize,
      });

      for (const item of pending) {
        await this.deliver(item);
      }
    } catch (error) {
      // Before migrations have run the table may not exist; do not crash boot.
      this.logger.warn(
        `Email queue worker skipped: ${(error as Error)?.message}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async deliver(item: EmailQueue): Promise<void> {
    const claimed = await this.queueRepository
      .createQueryBuilder()
      .update(EmailQueue)
      .set({
        status: EmailQueueStatus.PROCESSING,
        processedAt: new Date(),
        attempts: () => "attempts + 1",
      })
      .where("id = :id", { id: item.id })
      .andWhere("status = :status", { status: EmailQueueStatus.PENDING })
      .execute();

    if (!claimed.affected) return;

    try {
      await this.mailService.sendRaw({
        to: item.to,
        subject: item.subject,
        html: item.html,
        text: item.text,
      });

      await this.queueRepository.update(item.id, {
        status: EmailQueueStatus.SENT,
        sentAt: new Date(),
        lastError: null,
      });
    } catch (error) {
      const attempts = item.attempts + 1;
      const message = (error as Error)?.message || "Unknown email error";
      const shouldRetry = attempts < item.maxAttempts;

      await this.queueRepository.update(item.id, {
        status: shouldRetry
          ? EmailQueueStatus.PENDING
          : EmailQueueStatus.FAILED,
        lastError: message.slice(0, 2000),
        scheduledAt: shouldRetry
          ? new Date(Date.now() + attempts * 60 * 1000)
          : item.scheduledAt,
      });

      this.logger.warn(
        `Email ${item.id} to ${item.to} failed (attempt ${attempts}/${item.maxAttempts}): ${message}`,
      );
    }
  }
}
