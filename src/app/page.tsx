import { Cpu } from 'lucide-react';
import { SystemMonitor } from '@/components/system-monitor';
import { Terminal } from '@/components/terminal';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader>
          <h2 className="text-lg font-semibold text-primary group-data-[state=collapsed]:hidden">
            System Info
          </h2>
          <Cpu className="h-6 w-6 text-primary group-data-[state=expanded]:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SystemMonitor />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold text-primary">PyCommander</h1>
          </header>
          <main className="flex-1 overflow-hidden">
            <Terminal />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
