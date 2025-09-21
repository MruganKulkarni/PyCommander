'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, Activity } from 'lucide-react';

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
}

const initialProcesses: Process[] = [
  { pid: 101, name: 'kernel_task', cpu: 5.2, mem: 128 },
  { pid: 501, name: 'WindowServer', cpu: 8.1, mem: 256 },
  { pid: 734, name: 'NextJS', cpu: 12.5, mem: 512 },
  { pid: 812, name: 'CodeHelper', cpu: 2.3, mem: 180 },
];

export function SystemMonitor() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);
  const [processes, setProcesses] = useState<Process[]>([]);

  useEffect(() => {
    // Set initial values on mount to avoid hydration mismatch
    setCpuUsage(Math.floor(Math.random() * 20) + 10);
    setMemUsage(Math.floor(Math.random() * 20) + 30);
    setProcesses(initialProcesses);

    const interval = setInterval(() => {
      setCpuUsage(prev =>
        Math.min(100, Math.max(5, prev + (Math.random() - 0.5) * 5))
      );
      setMemUsage(prev =>
        Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 2))
      );
      setProcesses(prev =>
        prev.map(p => ({
          ...p,
          cpu: Math.max(0.1, p.cpu + (Math.random() - 0.5) * 2),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 p-2 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:space-y-0">
      <div className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 rounded-md group-data-[state=collapsed]:hover:bg-sidebar-accent">
        <Cpu className="h-5 w-5 text-primary" />
        <div className="ml-4 w-full group-data-[state=collapsed]:hidden">
          <p className="text-sm font-medium">CPU Usage</p>
          <Progress value={cpuUsage} className="mt-1 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {cpuUsage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="group-data-[state=collapsed]:flex group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 rounded-md group-data-[state=collapsed]:hover:bg-sidebar-accent">
        <MemoryStick className="h-5 w-5 text-primary" />
        <div className="ml-4 w-full group-data-[state=collapsed]:hidden">
          <p className="text-sm font-medium">Memory</p>
          <Progress value={memUsage} className="mt-1 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {memUsage.toFixed(1)}% ({(memUsage / 100 * 16).toFixed(1)}/16 GB)
          </p>
        </div>
      </div>
      
      <div className="group-data-[state=collapsed]:hidden">
        <div className="flex items-center">
            <Activity className="h-5 w-5 text-primary" />
            <p className="ml-4 text-sm font-medium">Processes</p>
        </div>
         <div className="mt-2 text-xs text-muted-foreground space-y-1">
            {processes.map(p => (
                <div key={p.pid} className="flex justify-between">
                    <span>{p.pid} {p.name}</span>
                    <span>{p.cpu.toFixed(1)}%</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
