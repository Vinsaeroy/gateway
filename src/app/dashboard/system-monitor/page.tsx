"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, HardDrive, Network, Server, MemoryStick } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SystemMonitorPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await fetch("/api/system/monitor");
            const result = await res.json();
            if (result.status) {
                setData(result.data);
            } else {
                toast.error(result.message || "Failed to fetch metrics");
            }
        } catch (error) {
            console.error("Monitor fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Poll every 3 seconds only if visible
    useEffect(() => {
        let isVisible = true;
        const handleVisibilityChange = () => {
            isVisible = document.visibilityState === 'visible';
            if (isVisible) fetchStats();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        fetchStats();

        const interval = setInterval(() => {
            if (isVisible) fetchStats();
        }, 3000);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    if (session?.user?.role !== "SUPERADMIN") {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Activity className="mx-auto h-12 w-12 text-red-500/50" />
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground">Only Super Admins can view system resources.</p>
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="p-4 sm:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Monitor <Badge className="ml-2" variant="outline">Live</Badge></h1>
                    <p className="text-muted-foreground">Real-time OS and Node process metrics.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-[300px] rounded-xl" />
                    <Skeleton className="h-[300px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Formatters
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor(seconds % 86400 / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
    };

    const memPercent = (data.memory.used / data.memory.total) * 100;
    const processMemPercent = (data.process.rss / data.memory.total) * 100;

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        System Monitor
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </h1>
                    <p className="text-muted-foreground">Real-time OS and Node process metrics.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border leading-tight">
                    <Server className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{data.os.distro} {data.os.release}</span>
                    <span className="hidden sm:inline">({data.os.platform})</span>
                    <span className="mx-1 opacity-50">•</span>
                    <span>Uptime: {formatUptime(data.os.uptime)}</span>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.cpu.load.toFixed(1)}%</div>
                        <Progress value={data.cpu.load} className="h-2 mt-3" indicatorClassName={data.cpu.load > 85 ? "bg-red-500" : data.cpu.load > 60 ? "bg-orange-500" : "bg-blue-500"} />
                        <p className="text-xs text-muted-foreground mt-2">{data.cpu.cores.length} Cores Average</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System RAM</CardTitle>
                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memPercent.toFixed(1)}%</div>
                        <Progress value={memPercent} className="h-2 mt-3" indicatorClassName={memPercent > 85 ? "bg-red-500" : memPercent > 60 ? "bg-amber-500" : "bg-purple-500"} />
                        <p className="text-xs text-muted-foreground mt-2">
                            {formatBytes(data.memory.used)} / {formatBytes(data.memory.total)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Node.js Process</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(data.process.rss)}</div>
                        <Progress value={processMemPercent} className="h-2 mt-3" indicatorClassName="bg-green-500" />
                        <p className="text-xs text-muted-foreground mt-2">
                            Uptime: {formatUptime(data.process.uptime)} ΓÇö Heap: {formatBytes(data.process.heapUsed)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
                        <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold space-y-1 mt-1">
                            <div className="flex items-center text-sm">
                                <span className="text-blue-500 font-bold w-10">Γåô RX</span>
                                <span>{formatBytes(data.network[0]?.rx_sec || 0)}/s</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className="text-green-500 font-bold w-10">Γåæ TX</span>
                                <span>{formatBytes(data.network[0]?.tx_sec || 0)}/s</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 pt-1 border-t truncate">
                            Iface: {data.network[0]?.iface || 'Unknown'} (Active)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* CPU Cores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">CPU Cores Breakdown</CardTitle>
                        <CardDescription>Individual load percentage for each logical core.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {data.cpu.cores.map((load: number, i: number) => (
                                <div key={i} className="bg-muted/40 p-3 rounded-lg border text-center relative overflow-hidden">
                                    {/* Fake progress bg */}
                                    {load > 0 && <div className={`absolute bottom-0 left-0 right-0 opacity-20 transition-all duration-300 ${load > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ height: `${load}%` }} />}
                                    <div className="relative z-10">
                                        <p className="text-xs text-muted-foreground font-mono">Core {i}</p>
                                        <p className={`text-lg font-bold ${load > 85 ? 'text-red-500' : ''}`}>{load.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Disks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Storage Volumes</CardTitle>
                        <CardDescription>Mounted filesystems and current space usage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {data.disk.map((d: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 font-medium">
                                        <HardDrive className="h-4 w-4" />
                                        {d.fs} <span className="text-muted-foreground font-normal">({d.mount})</span>
                                    </div>
                                    <div className="font-mono text-xs">
                                        {formatBytes(d.used)} / {formatBytes(d.size)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Progress value={d.usePercent} className="h-2" indicatorClassName={d.usePercent > 90 ? "bg-red-500" : "bg-primary"} />
                                    <span className={`text-xs w-10 text-right ${d.usePercent > 90 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{d.usePercent.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                        {data.disk.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                No disk information available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
