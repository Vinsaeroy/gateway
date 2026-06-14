import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, isAdmin } from "@/lib/api-auth";
import { getPlanConfig, type PlanId } from "@/lib/plans";
import bcrypt from "bcryptjs";

const VALID_PLANS: PlanId[] = ["FREE", "STANDARD", "PRO", "ENTERPRISE"];

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthenticatedUser(request);

    // Only SUPERADMIN can update users
    if (!user || !isAdmin(user.role)) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, email, password, role, plan, planDurationDays } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Ubah plan user (oleh SUPERADMIN)
        if (plan !== undefined) {
            const planId = String(plan).toUpperCase() as PlanId;
            if (!VALID_PLANS.includes(planId)) {
                return NextResponse.json({ status: false, message: "Plan tidak valid", error: "invalid_plan" }, { status: 400 });
            }
            updateData.plan = planId;
            if (planId === "FREE") {
                // FREE tidak punya masa aktif
                updateData.planExpiresAt = null;
            } else {
                // Hitung masa aktif: pakai planDurationDays kalau dikirim, kalau tidak pakai default plan.
                // planDurationDays = 0 atau null -> tanpa kedaluwarsa (lifetime).
                const cfg = getPlanConfig(planId);
                const days = planDurationDays === undefined ? cfg.durationDays : Number(planDurationDays);
                if (days && days > 0) {
                    updateData.planExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                } else {
                    updateData.planExpiresAt = null; // lifetime
                }
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                planExpiresAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ status: true, message: "User updated successfully", data: updatedUser });

    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ status: false, message: "Failed to update user", error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthenticatedUser(request);

    // Only SUPERADMIN can delete users
    if (!user || !isAdmin(user.role)) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (id === user.id) {
        return NextResponse.json({ status: false, message: "Cannot delete yourself", error: "Cannot delete yourself" }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ status: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ status: false, message: "Failed to delete user", error: "Failed to delete user" }, { status: 500 });
    }
}
