import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// PUT: Update label
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, labelId: string }> }
) {
    
    try {
        const { sessionId, labelId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, color } = body;

        // Find label and verify access
        const label = await prisma.label.findUnique({
            where: { id: labelId }
        });

        if (!label) {
            return NextResponse.json({ status: false, message: "Label not found", error: "Label not found" }, { status: 404 });
        }

        if (label.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Label does not belong to this session", error: "Label does not belong to this session" }, { status: 404 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, label.sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this label", error: "Forbidden - Cannot access this label" }, { status: 403 });
        }

        // Prepare update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (color !== undefined) {
            if (color < 0 || color > 19) {
                return NextResponse.json({ status: false, message: "Color must be between 0 and 19", error: "Color must be between 0 and 19" }, { status: 400 });
            }
            const colorMap = [
                "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF",
                "#4B0082", "#9400D3", "#FF1493", "#00CED1", "#32CD32",
                "#FFD700", "#FF69B4", "#8B4513", "#2F4F4F", "#696969",
                "#708090", "#778899", "#B0C4DE", "#ADD8E6", "#F0E68C"
            ];
            updateData.color = color;
            updateData.colorHex = colorMap[color];
        }

        const updatedLabel = await prisma.label.update({
            where: { id: labelId },
            data: updateData
        });

        return NextResponse.json({ status: true, message: "Operation successful", data: updatedLabel });

    } catch (error) {
        console.error("Update label error:", error);
        return NextResponse.json({ status: false, message: "Failed to update label", error: "Failed to update label" }, { status: 500 });
    }
}

// DELETE: Delete label
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, labelId: string }> }
) {
    try {
        const { sessionId, labelId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Find label and verify access
        const label = await prisma.label.findUnique({
            where: { id: labelId }
        });

        if (!label) {
            return NextResponse.json({ status: false, message: "Label not found", error: "Label not found" }, { status: 404 });
        }

        if (label.sessionId !== sessionId) {
            return NextResponse.json({ status: false, message: "Label does not belong to this session", error: "Label does not belong to this session" }, { status: 404 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, label.sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this label", error: "Forbidden - Cannot access this label" }, { status: 403 });
        }

        // Delete label (cascade will delete chatLabels)
        await prisma.label.delete({
            where: { id: labelId }
        });

        return NextResponse.json({ status: true, message: "Label deleted successfully" });

    } catch (error) {
        console.error("Delete label error:", error);
        return NextResponse.json({ status: false, message: "Failed to delete label", error: "Failed to delete label" }, { status: 500 });
    }
}
