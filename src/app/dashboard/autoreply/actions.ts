"use server";

import { prisma } from "@/lib/prisma";
import { canAccessSession } from "@/lib/api-auth";
import { getAuthenticatedUserForAction } from "@/lib/server-action-auth";
import { Prisma } from "@prisma/client";

// Fetch rules directly from DB without API call
export async function getAutoReplies(sessionId: string) {
    const nextAuthSession = await getAuthenticatedUserForAction();
    if (!nextAuthSession) {
        throw new Error("Unauthorized");
    }

    const canAccess = await canAccessSession(nextAuthSession.id, nextAuthSession.role, sessionId);
    if (!canAccess) {
        throw new Error("Forbidden");
    }

    const session = await prisma.session.findUnique({
        where: { sessionId: sessionId },
        select: { id: true }
    });

    if (!session) {
        throw new Error("Session not found");
    }

    const rules = await prisma.autoReply.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: 'desc' }
    });

    return rules;
}

// Create a new auto reply directly to DB
export async function createAutoReply(sessionId: string, data: { keyword: string; response: string; matchType: string; isMedia: boolean; mediaUrl?: string | null; triggerType: string }) {
    const nextAuthSession = await getAuthenticatedUserForAction();
    if (!nextAuthSession) {
        throw new Error("Unauthorized");
    }

    if (!data.keyword || !data.response) {
        throw new Error("Missing required fields");
    }

    const canAccess = await canAccessSession(nextAuthSession.id, nextAuthSession.role, sessionId);
    if (!canAccess) {
        throw new Error("Forbidden");
    }

    const session = await prisma.session.findUnique({
        where: { sessionId: sessionId },
        select: { id: true }
    });

    if (!session) {
        throw new Error("Session not found");
    }

    const createData: Prisma.AutoReplyUncheckedCreateInput = {
        sessionId: session.id,
        keyword: data.keyword,
        response: data.response,
        matchType: data.matchType || "EXACT",
        isMedia: data.isMedia || false,
        mediaUrl: data.mediaUrl || null,
        // @ts-ignore
        triggerType: data.triggerType || "ALL"
    };

    const newRule = await prisma.autoReply.create({
        data: createData
    });

    return newRule;
}

export async function deleteAutoReply(sessionId: string, ruleId: string) {
    const nextAuthSession = await getAuthenticatedUserForAction();
    if (!nextAuthSession) {
        throw new Error("Unauthorized");
    }

    const rule = await prisma.autoReply.findUnique({
        where: { id: ruleId },
        include: { session: true }
    });

    if (!rule) {
        throw new Error("Rule not found");
    }

    const canAccess = await canAccessSession(nextAuthSession.id, nextAuthSession.role, rule.session.sessionId);
    if (!canAccess || rule.session.sessionId !== sessionId) {
        throw new Error("Forbidden");
    }

    await prisma.autoReply.delete({ where: { id: ruleId } });
    return { success: true };
}

export async function updateAutoReply(sessionId: string, ruleId: string, data: { keyword: string; response: string; matchType: string; isMedia: boolean; mediaUrl?: string | null; triggerType: string }) {
    const nextAuthSession = await getAuthenticatedUserForAction();
    if (!nextAuthSession) {
        throw new Error("Unauthorized");
    }

    if (!data.keyword || !data.response) {
        throw new Error("Missing required fields");
    }

    const rule = await prisma.autoReply.findUnique({
        where: { id: ruleId },
        include: { session: true }
    });

    if (!rule) {
        throw new Error("Rule not found");
    }

    const canAccess = await canAccessSession(nextAuthSession.id, nextAuthSession.role, rule.session.sessionId);
    if (!canAccess || rule.session.sessionId !== sessionId) {
        throw new Error("Forbidden");
    }

    const updateData: Prisma.AutoReplyUncheckedUpdateInput = {
        keyword: data.keyword,
        response: data.response,
        matchType: data.matchType || "EXACT",
        isMedia: data.isMedia || false,
        mediaUrl: data.mediaUrl || null,
        // @ts-ignore
        triggerType: data.triggerType || "ALL"
    };

    const updatedRule = await prisma.autoReply.update({
        where: { id: ruleId },
        data: updateData
    });

    return updatedRule;
}
