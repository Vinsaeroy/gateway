
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";

import { Search, Loader2, User, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useTranslation } from "@/i18n/react";

interface Contact {
    id: string;
    jid: string;
    name?: string;
    notify?: string;
    verifiedName?: string;
    profilePic?: string;
    remoteJidAlt?: string;
}

export default function ContactListPage() {
    const { t } = useTranslation();
    const { sessionId } = useSession();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState("10");
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchContacts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch on page/session/limit change
    useEffect(() => {
        fetchContacts();
    }, [page, sessionId, limit]);

    const fetchContacts = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit,
                search: search
            });

            const res = await fetch(`/api/contacts/${sessionId}?${params}`);
            const data = await res.json();

            if (res.ok) {
                setContacts(data.data);
                setMeta(data.meta);
            } else {
                setContacts([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t("contacts.page.title")}</h2>
                        <p className="text-muted-foreground">
                            {t("contacts.page.subtitle")}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="space-y-1">
                                <CardTitle>{t("contacts.list.title")}</CardTitle>
                                <CardDescription>
                                    {t("contacts.list.total", { total: meta.total })}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Select value={limit} onValueChange={(val) => { setLimit(val); setPage(1); }}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder={t("contacts.perPagePlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50, 100].map((l) => (
                                            <SelectItem key={l} value={l.toString()}>
                                                {t("contacts.perPageOption", { limit: l })}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="all">{t("contacts.showAll")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("contacts.searchPlaceholder")}
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">{t("contacts.table.image")}</TableHead>
                                        <TableHead>{t("contacts.table.name")}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t("contacts.table.jid")}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t("contacts.table.phone")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {t("contacts.loading")}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : contacts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                {t("contacts.empty")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        contacts.map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell>
                                                    <Avatar>
                                                        <AvatarImage src={contact.profilePic || ""} />
                                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{contact.name || contact.notify || t("contacts.unknown")}</span>
                                                        {contact.verifiedName && (
                                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                                ✓ {contact.verifiedName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                                                    {contact.jid}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">
                                                    {contact.remoteJidAlt || "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <Button
                                                variant="ghost"
                                                disabled={page <= 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                            >
                                                {t("contacts.pagination.previous")}
                                            </Button>
                                        </PaginationItem>

                                        <PaginationItem>
                                            <span className="text-sm text-muted-foreground mx-4">
                                                {t("contacts.pagination.pageOf", { page, totalPages: meta.totalPages })}
                                            </span>
                                        </PaginationItem>

                                        <PaginationItem>
                                            <Button
                                                variant="ghost"
                                                disabled={page >= meta.totalPages}
                                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                            >
                                                {t("contacts.pagination.next")}
                                            </Button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SessionGuard>
    );
}
