
'use client';

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ExternalLink, Users, FileText, UserX, Crown, TrendingUp, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";


interface VerifiedUser {
    id: string;
    brand: string;
    domain: string;
    email: string;
    keywords: string;
    verified_at: Date;
}

interface Report {
    id: string;
    name: string;
    domain:string;
    created_at: Date;
    created_by: string;
}

interface Otp {
    id: string;
}

interface ChartData {
    name: string;
    count: number;
}

const MetricCard = ({ icon: Icon, title, value, isLoading }: { icon: React.ElementType, title: string, value: string | number, isLoading: boolean }) => (
    <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [users, setUsers] = useState<VerifiedUser[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [otps, setOtps] = useState<Otp[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState<VerifiedUser | null>(null);
    const [userReports, setUserReports] = useState<Report[]>([]);
    const [loadingUserReports, setLoadingUserReports] = useState(false);
    
    useEffect(() => {
        async function getAnalyticsData() {
            try {
                // Fetch all data concurrently
                const [usersSnapshot, reportsSnapshot, otpsSnapshot] = await Promise.all([
                    getDocs(collection(db, "verified_users")),
                    getDocs(collection(db, "reports")),
                    getDocs(collection(db, "otps")),
                ]);

                // Process users
                const userList: VerifiedUser[] = usersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const verifiedAt = data.verified_at instanceof Timestamp
                        ? data.verified_at.toDate()
                        : new Date(data.verified_at);
                    return {
                        id: doc.id,
                        brand: data.brand || 'N/A',
                        domain: data.domain || 'N/A',
                        email: data.email || doc.id,
                        keywords: data.keywords || 'N/A',
                        verified_at: verifiedAt,
                    };
                });
                setUsers(userList.sort((a, b) => b.verified_at.getTime() - a.verified_at.getTime()));

                // Process reports
                const reportList: Report[] = reportsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAt = data.created_at instanceof Timestamp
                        ? data.created_at.toDate()
                        : new Date(data.created_at || Date.now());
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        domain: data.domain || 'N/A',
                        created_at: createdAt,
                        created_by: data.created_by || 'N/A',
                    };
                });
                setReports(reportList);

                // Process OTPs
                const otpList: Otp[] = otpsSnapshot.docs.map(doc => ({ id: doc.id }));
                setOtps(otpList);

            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        }
        getAnalyticsData();
    }, []);

    const handleFetchUserReports = async (user: VerifiedUser) => {
        setSelectedUser(user);
        setLoadingUserReports(true);
        
        const filteredReports = reports.filter(report => report.created_by === user.email);
        setUserReports(filteredReports.sort((a,b) => b.created_at.getTime() - a.created_at.getTime()));
        
        setLoadingUserReports(false);
    };

    const getBestUser = () => {
        if (reports.length === 0) return "N/A";
        const reportCounts = reports.reduce((acc, report) => {
            acc[report.created_by] = (acc[report.created_by] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const bestUserEmail = Object.keys(reportCounts).reduce((a, b) => reportCounts[a] > reportCounts[b] ? a : b);
        const reportCount = reportCounts[bestUserEmail];

        return `${bestUserEmail} (${reportCount} reports)`;
    };
    
    const processDataForChart = (data: (VerifiedUser | Report)[], dateField: 'verified_at' | 'created_at'): ChartData[] => {
        const countsByDay: Record<string, number> = {};
        data.forEach(item => {
            const date = item[dateField];
            if (date) {
                const day = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                countsByDay[day] = (countsByDay[day] || 0) + 1;
            }
        });
        return Object.entries(countsByDay).map(([name, count]) => ({ name, count })).reverse();
    };

    const userChartData = processDataForChart(users, 'verified_at');
    const reportChartData = processDataForChart(reports, 'created_at');

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
             <nav className="w-full bg-card border-b border-border/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="https://getclevrr.com/wp-content/uploads/2025/06/01.1-Transparent-BG-Color_Black.png"
                                alt="Clevrr AI Logo"
                                width={80}
                                height={60}
                                className="rounded-md"
                            />
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="text-primary font-light">|</span> Search Detective
                            </h1>
                        </Link>
                        <Link href="https://getclevrr.com?utm_source=search_detective&utm_medium=app&utm_campaign=learn_more" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity">
                            <Sparkles className="mr-2 h-5 w-5" />What's Clevrr AI?
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
                <header className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Usage Analytics Dashboard</h2>
                    <p className="text-muted-foreground text-xl">
                        Overview of verified users and their activity.
                    </p>
                </header>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard icon={Users} title="Total Verified Users" value={users.length} isLoading={loading} />
                    <MetricCard icon={FileText} title="Total Reports Generated" value={reports.length} isLoading={loading} />
                    <MetricCard icon={UserX} title="Unverified Users" value={otps.length} isLoading={loading} />
                    <MetricCard icon={Crown} title="Best User" value={getBestUser()} isLoading={loading} />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp/> Users Verified Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={userChartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New Users" />
                                </RechartsBarChart>
                            </ResponsiveContainer>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart/> Reports Generated Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                             {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={reportChartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <Tooltip />
                                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="New Reports" />
                                </RechartsBarChart>
                            </ResponsiveContainer>}
                        </CardContent>
                    </Card>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>Verified Users</CardTitle>
                        <CardDescription>A list of all users who have successfully verified their email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Keywords</TableHead>
                                    <TableHead className="text-right">Verified At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                     <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <div className="flex justify-center items-center p-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : users.length > 0 ? users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                             <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="secondary" size="sm" onClick={() => handleFetchUserReports(user)}>
                                                        More Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Detailed Reports for {selectedUser?.email}</DialogTitle>
                                                        <DialogDescription>A list of reports generated by this user.</DialogDescription>
                                                    </DialogHeader>
                                                     {loadingUserReports ? (
                                                        <div className="flex justify-center items-center p-8">
                                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        </div>
                                                    ) : (
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Brand Name</TableHead>
                                                                    <TableHead>Domain</TableHead>
                                                                    <TableHead>Created At</TableHead>
                                                                    <TableHead className="text-right">Action</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {userReports.length > 0 ? userReports.map(report => (
                                                                    <TableRow key={report.id}>
                                                                        <TableCell>{report.name}</TableCell>
                                                                        <TableCell>
                                                                            <a href={report.domain} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                                                {report.domain}
                                                                            </a>
                                                                        </TableCell>
                                                                        <TableCell>{report.created_at.toLocaleDateString()}</TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button asChild variant="outline" size="sm">
                                                                                <Link href={`/report/${report.id}`} target="_blank">
                                                                                    View Report <ExternalLink className="ml-2 h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )) : (
                                                                    <TableRow>
                                                                        <TableCell colSpan={4} className="text-center">No reports found for this user.</TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>{user.brand}</TableCell>
                                        <TableCell>
                                            <a href={user.domain} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                {user.domain}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate">{user.keywords}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.verified_at.toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No verified users found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

