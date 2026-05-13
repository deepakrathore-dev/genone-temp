import { Sidebar } from "@/components/global/Sidebar";
import { Topbar } from "@/components/global/Topbar";

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 max-w-[1500px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
