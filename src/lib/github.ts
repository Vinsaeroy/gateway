import { logger } from "./logger";

export async function getLatestRelease(owner: string, repo: string) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const res = await fetch(url, {
            headers: {
                "Accept": "application/vnd.github+json",
                "User-Agent": "WA-AKG-System"
            },
            cache: 'no-store' // Disable cache for debugging
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            logger.error("GitHub", `API Error: ${res.status} ${res.statusText} - ${errorText}`);
            return null;
        }
        
        const data = await res.json();
        return {
            tag_name: data.tag_name, // e.g. v1.0.1
            name: data.name,
            html_url: data.html_url,
            body: data.body,
            published_at: data.published_at
        };
    } catch (e) {
        logger.error("GitHub", "Error fetching GitHub release:", e);
        return null;
    }
}
