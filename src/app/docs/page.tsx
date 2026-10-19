import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { DocsClient } from './docs-client';
import { prisma } from '@/lib/prisma';
import { getT } from '@/i18n/server';
import type { Metadata } from 'next';

// Nama app dari Settings (DB) → env APP_NAME → fallback "WA-AKG".
async function getAppName(): Promise<string> {
    try {
        const cfg = await prisma.systemConfig.findUnique({
            where: { id: 'default' },
            select: { appName: true },
        });
        if (cfg?.appName) return cfg.appName;
    } catch { /* ignore */ }
    return process.env.APP_NAME || 'WA-AKG';
}

export async function generateMetadata(): Promise<Metadata> {
    const appName = await getAppName();
    const t = await getT();
    return {
        title: t("docs.page.metaTitle", { appName }),
        description: t("docs.page.metaDescription", { appName }),
    };
}

// Interface for Nested TOC
export interface TocItem {
    text: string;
    id: string;
}

export interface TocSection {
    title: string;
    id: string;
    items: TocItem[];
}

export default async function PublicDocsPage() {
    const filePath = path.join(process.cwd(), 'docs', 'API_DOCUMENTATION.md');
    const packagePath = path.join(process.cwd(), 'package.json');
    const appName = await getAppName();
    const t = await getT();
    let content = '';
    let version = 'v1.0.0';

    try {
        content = fs.readFileSync(filePath, 'utf8');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        version = `v${packageJson.version}`;
    } catch (err) {
        content = t("docs.page.fallback");
        console.error("Error loading docs:", err);
    }

    // Nested TOC Generation
    const toc: TocSection[] = [];
    let currentSection: TocSection | null = null;

    content.split('\n').forEach(line => {
        if (line.startsWith('## ')) {
            // H2 - New Section
            const text = line.replace(/^## /, '').trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');

            // If we have a current section, push it to toc
            if (currentSection) {
                toc.push(currentSection);
            }

            currentSection = {
                title: text,
                id: id,
                items: []
            };
        } else if (line.startsWith('### ') && currentSection) {
            // H3 - Item in current section
            const text = line.replace(/^### /, '').trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            currentSection.items.push({ text, id });
        }
    });

    // Push the last section if exists
    if (currentSection) {
        toc.push(currentSection);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 shadow-sm/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" translate="no">
                            {appName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200">
                            {version}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/swagger"
                            className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            {t("docs.page.swaggerLink")}
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                        >
                            {t("docs.page.dashboardLink")}
                        </Link>
                    </div>
                </div>
            </header>

            <DocsClient content={content} toc={toc} />
        </div>
    );
}
