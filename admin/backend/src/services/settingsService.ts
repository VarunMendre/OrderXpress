import { AdminSettingsRecord } from "../models/settings.types";
import { SettingsInput } from "../validators/settings.schema";

let settings: AdminSettingsRecord = {
  restaurantName: "OrderXpress Demo Kitchen",
  tableCount: 12,
  bankAccountName: "OrderXpress Demo Kitchen",
  bankAccountNumber: "000000000000",
  bankIfscCode: "DEMO0000001",
  supportEmail: "support@orderxpress.local",
};

export function getSettingsResponse() {
  return {
    success: true,
    message: "Settings loaded successfully.",
    data: settings,
  };
}

export function updateSettingsResponse(input: SettingsInput) {
  settings = {
    restaurantName: input.restaurantName,
    tableCount: input.tableCount,
    bankAccountName: input.bankAccountName ?? "",
    bankAccountNumber: input.bankAccountNumber ?? "",
    bankIfscCode: input.bankIfscCode ?? "",
    supportEmail: input.supportEmail ?? "",
  };

  return {
    success: true,
    message: "Settings saved successfully.",
    data: settings,
  };
}

