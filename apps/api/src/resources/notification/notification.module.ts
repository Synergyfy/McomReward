import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { Notification } from "./entities/notification.entity";
import { NotificationTemplate } from "./entities/notification-template.entity";
import { Announcement } from "./entities/announcement.entity";
import { NotificationAdminService } from "./services/notification-admin.service";
import {
  AdminNotificationTemplateController,
  AdminAnnouncementController,
} from "./controllers/admin-notification.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationTemplate, Announcement]),
  ],
  controllers: [
    NotificationController,
    AdminNotificationTemplateController,
    AdminAnnouncementController,
  ],
  providers: [NotificationService, NotificationAdminService],
  exports: [NotificationService, NotificationAdminService],
})
export class NotificationModule {}