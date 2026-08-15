import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listMyNotifications } from "@/lib/data/customer-notifications";
import { NotificationsList } from "@/components/account/notifications-list";

export default async function CompteNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/notifications");

  const notifications = await listMyNotifications(50);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Notifications</h1>

      <div className="mt-8">
        <NotificationsList initialNotifications={notifications} />
      </div>
    </div>
  );
}
