
"use client";

import NextTopLoader from "nextjs-toploader";

export function TopLoader() {
    return (
        <NextTopLoader
            color="#10b981"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
    );
}
