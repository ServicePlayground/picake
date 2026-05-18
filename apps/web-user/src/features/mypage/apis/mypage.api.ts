import { consumerClient } from "@/apps/web-user/common/config/axios.config";
import type { MypageProfile } from "@/apps/web-user/features/mypage/types/profile.type";

export interface UpdateMypageProfileBody {
  name?: string;
  nickname?: string;
  profileImageUrl?: string | null;
}

export interface ChangePhoneBody {
  newPhone: string;
}

export interface WithdrawBody {
  reason: string;
}

export interface NotificationPreferences {
  pushNotificationsEnabled: boolean;
}

export interface UpdateNotificationPreferencesBody {
  pushNotificationsEnabled?: boolean;
}

export const mypageApi = {
  getProfile: async (): Promise<MypageProfile> => {
    const response = await consumerClient.get("/mypage/profile");
    return response.data.data;
  },
  updateProfile: async (body: UpdateMypageProfileBody): Promise<MypageProfile> => {
    const response = await consumerClient.patch("/mypage/profile", body);
    return response.data.data;
  },
  changePhone: async (body: ChangePhoneBody): Promise<{ message: string }> => {
    const response = await consumerClient.post("/mypage/change-phone", body);
    return response.data.data;
  },
  withdraw: async (body: WithdrawBody): Promise<{ message: string }> => {
    const response = await consumerClient.post("/mypage/withdraw", body);
    return response.data.data;
  },
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await consumerClient.get("/mypage/notification-preferences");
    return response.data.data;
  },
  updateNotificationPreferences: async (
    body: UpdateNotificationPreferencesBody,
  ): Promise<NotificationPreferences> => {
    const response = await consumerClient.put("/mypage/notification-preferences", body);
    return response.data.data;
  },
};
