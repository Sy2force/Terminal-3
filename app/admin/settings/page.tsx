import { redirect } from "next/navigation";

export const metadata = {
  title: "Paramètres | Terminal 3 Admin",
};

export default function SettingsPage() {
  redirect("/admin/store");
}
