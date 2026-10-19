const legal = {
    privacy: {
        backToHome: "Back to Home",
        title: "Privacy Policy",
        metaDescription: "Privacy Policy and Data Handling for WA-AKG.",
        effectiveDate: "Effective Date: {date}",
        intro:
            "At WA-AKG, we believe that your data is your property. This Privacy Policy details the strict boundaries regarding how information is handled when using our open-source, self-hosted WhatsApp Gateway.",
        s1: {
            title: "1. Zero-Tracking Architecture",
            bodyBefore: "Because WA-AKG is designed to be ",
            bodyStrong: "self-hosted",
            bodyAfter:
                ", all core data processing occurs exclusively on the hardware where you deploy the application.",
            noTelemetryLabel: "No Centralized Telemetry:",
            noTelemetryText:
                "The creators of WA-AKG do not receive telemetry, analytics, or usage reports about your WhatsApp interactions.",
            ownershipLabel: "Absolute Data Ownership:",
            ownershipText:
                "Your contacts, messages, schedules, and auto-replies remain in your own database. We cannot and will not access it.",
        },
        s2: {
            title: "2. Data We Process Locally",
            body: "When you deploy the gateway, the application running on your server interacts with:",
            credentialsLabel: "Authentication Credentials:",
            credentialsText:
                "Passwords you create for the dashboard are securely hashed using bcrypt before being stored in your local database.",
            sessionsLabel: "WhatsApp Sessions:",
            sessionsText:
                "WA-AKG acts as a bridge to WhatsApp Web. The session tokens (keys) necessary to maintain this connection are stored locally on your server.",
            logsLabel: "Communication Logs:",
            logsText:
                "Messages sent and received via the gateway are logged within your local database to provide you with historical data and webhook functionality.",
        },
        s3: {
            title: "3. Protecting Your Information",
            body:
                "While WA-AKG is built with modern security practices, the ultimate safety of your data depends on your hosting environment. We strongly recommend:",
            proxyBefore:
                "Deploying the application behind a reverse proxy with enforced ",
            proxyStrong: "SSL/TLS encryption",
            proxyAfter: " (HTTPS).",
            firewall: "Securing the host server with firewalls and SSH key authentication.",
            updates:
                "Keeping the underlying operating system and Node.js environment constantly updated.",
        },
        s4: {
            title: "4. Third-Party Integrations",
            bodyBefore: "WA-AKG utilizes the ",
            bodyAfter:
                " library to communicate directly with WhatsApp's servers. By using this gateway, your server will establish a direct web-socket connection to WhatsApp. Please be aware that your use of WhatsApp is still subject to Meta's Privacy Policy.",
        },
        needDetails: "Need Further Details?",
        needDetailsBefore:
            "If you have specific questions about data handling or wish to audit the code, please visit our ",
        needDetailsLink: "GitHub Repository",
        needDetailsAfter: ".",
    },
    terms: {
        backToHome: "Back to Home",
        title: "Terms of Service",
        metaDescription: "Terms of Service and Usage Guidelines for WA-AKG.",
        lastUpdated: "Last updated: {date}",
        intro:
            "Welcome to WA-AKG. By accessing or using our WhatsApp Gateway platform, you agree to be bound by these Terms. If you do not agree, please do not use the service.",
        s1: {
            title: "1. Data Security & Responsibility",
            body:
                "Security forms the core of our service. As a self-hosted platform, WA-AKG ensures that your data remains strictly within your own infrastructure.",
            yoursLabel: "Your Data is Yours:",
            yoursText:
                "We do not track, intercept, or sell your WhatsApp messages, contact lists, or session data. Your information is secure and not misused.",
            safeLabel: "Safe Usage:",
            safeText:
                "You are responsible for ensuring your hardware and server environments are properly secured.",
            authLabel: "Authentication:",
            authText:
                "You must safeguard your account credentials. Do not share your login details with unauthorized personnel.",
        },
        s2: {
            title: "2. Acceptable Use Policy",
            body:
                "When utilizing WA-AKG's API, auto-replies, and broadcasting capabilities, you agree to abide by WhatsApp's official Terms of Service and Anti-Spam policies. You agree not to:",
            spam: 'Send unsolicited "spam" messages or bulk promotional campaigns to users who have not explicitly opted-in.',
            malware:
                "Use the platform to distribute malicious software, phishing links, or illegal content.",
            overload:
                "Attempt to reverse-engineer the core API or overload the service with excessive requests.",
        },
        s3: {
            title: "3. Account Integrity",
            body:
                "WA-AKG provides tools to manage multiple WhatsApp sessions. It is crucial to monitor your active devices. If you suspect unauthorized access to your gateway dashboard, immediately change your password and revoke any connected WhatsApp sessions from your physical device.",
        },
        s4: {
            title: "4. Disclaimers and Limitations",
            body:
                'WA-AKG is provided "as is" and without warranties of any kind. We utilize third-party libraries (such as Baileys) to connect to WhatsApp web protocols. Changes to WhatsApp\'s internal systems may occasionally disrupt service. We are not liable for any account suspensions or bans imposed by WhatsApp as a result of your usage.',
        },
        questions: "Have questions about these terms?",
        questionsBefore: "Please review our ",
        questionsLink: "Documentation",
        questionsAfter:
            " or reach out to the project maintainers for further clarification.",
    },
} as const;

export default legal;
