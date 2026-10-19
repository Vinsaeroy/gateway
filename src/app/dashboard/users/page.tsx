"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit, User, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/i18n/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    role: "SUPERADMIN" | "OWNER" | "STAFF";
    plan?: "FREE" | "STANDARD" | "PRO" | "ENTERPRISE";
    planExpiresAt?: string | null;
    createdAt: string;
    _count?: {
        sessions: number;
    }
}

export default function UsersPage() {
    const { data: session } = useSession();
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
        plan: "FREE"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const responseData = await res.json();
                setUsers(responseData?.data || []);
            } else if (res.status === 403) {
                toast.error(t("users.toast.unauthorized"));
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
            const method = editingUser ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingUser ? t("users.toast.updated") : t("users.toast.created"));
                setShowForm(false);
                setEditingUser(null);
                setFormData({ name: "", email: "", password: "", role: "STAFF", plan: "FREE" });
                fetchUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || t("users.toast.operationFailed"));
            }
        } catch (error) {
            toast.error(t("users.toast.operationFailed"));
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success(t("users.toast.deleted"));
                fetchUsers();
            } else {
                const error = await res.json();
                toast.error(error.error || t("users.toast.deleteRejected"));
            }
        } catch (error) {
            toast.error(t("users.toast.deleteFailed"));
        } finally {
            setDeleteId(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "SUPERADMIN": return <ShieldAlert className="h-4 w-4 text-red-500" />;
            case "OWNER": return <ShieldCheck className="h-4 w-4 text-blue-500" />;
            default: return <User className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t("users.loading")}</div>;

    // TODO: Improve RBAC check here if strictly needed, but API protects it.
    // If empty list and not loading, likely unauthorized or empty.

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6" /> {t("users.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
                </div>
                <Button size="sm" onClick={() => {
                    setEditingUser(null);
                    setFormData({ name: "", email: "", password: "", role: "STAFF", plan: "FREE" });
                    setShowForm(true);
                }}>
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" /> {t("users.addUser")}
                </Button>
            </div>

            {/* User Form Modal/Card */}
            {showForm && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>{editingUser ? t("users.form.editTitle") : t("users.form.newTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label>{t("users.form.name")}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("users.form.email")}</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label>{editingUser ? t("users.form.newPassword") : t("users.form.password")}</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("users.form.role")}</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SUPERADMIN">{t("users.roles.SUPERADMIN")}</SelectItem>
                                            <SelectItem value="OWNER">{t("users.roles.OWNER")}</SelectItem>
                                            <SelectItem value="STAFF">{t("users.roles.STAFF")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {editingUser && (
                                <div className="space-y-2">
                                    <Label>{t("users.form.plan")}</Label>
                                    <Select
                                        value={formData.plan}
                                        onValueChange={(v: string) => setFormData({ ...formData, plan: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FREE">{t("users.plans.FREE")}</SelectItem>
                                            <SelectItem value="STANDARD">{t("users.plans.STANDARD")}</SelectItem>
                                            <SelectItem value="PRO">{t("users.plans.PRO")}</SelectItem>
                                            <SelectItem value="ENTERPRISE">{t("users.plans.ENTERPRISE")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("users.form.planHint")}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t("users.form.cancel")}</Button>
                                <Button type="submit">{editingUser ? t("users.form.update") : t("users.form.create")}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {users.map(user => (
                    <Card key={user.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-start gap-2 mb-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                            {user.name?.charAt(0) || user.email.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold truncate">{user.name || t("users.card.fallbackName")}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                                        {getRoleIcon(user.role)}
                                        {user.role}
                                    </Badge>
                                </div>

                                <div className="mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                        {t("users.card.planLabel", { plan: user.plan || "FREE" })}
                                        {user.planExpiresAt ? ` ${t("users.card.planUntil", { date: new Date(user.planExpiresAt).toLocaleDateString() })}` : ""}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground gap-2">
                                    <span className="truncate">{t("users.card.sessions", { count: user._count?.sessions || 0 })}</span>
                                    <span className="truncate">{t("users.card.joined", { date: new Date(user.createdAt).toLocaleDateString() })}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 flex justify-end gap-2 border-t">
                                <Button size="sm" variant="ghost" onClick={() => {
                                    setEditingUser(user);
                                    setFormData({
                                        name: user.name || "",
                                        email: user.email,
                                        password: "",
                                        role: user.role,
                                        plan: user.plan || "FREE"
                                    });
                                    setShowForm(true);
                                }}>
                                    <Edit className="h-4 w-4 mr-1" /> {t("users.card.edit")}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" /> {t("users.card.delete")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("users.dialog.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("users.dialog.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("users.dialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{t("users.dialog.continue")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
