import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-[60vh] bg-cream/70">
      <div className="border-b border-blush-dp bg-white/80 backdrop-blur">
        <div className="shell flex flex-wrap items-center gap-4 py-4">
          <span className="flex items-center gap-2 font-display font-semibold text-flame">
            <span aria-hidden="true">🛠️</span> Admin
          </span>
          <div className="min-w-0 flex-1">
            <AdminNav />
          </div>
        </div>
      </div>

      <div className="shell py-10">{children}</div>
    </div>
  );
}
