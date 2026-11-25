const DINO_LINES: string[] = [
  "____",
  "  ___                                      .-~. /_\"-._",
  "`-._~-.                                  / /_ \"~o\\  :Y",
  "      \\  \\                                / : \\~x.  ` ')",
  "      ]  Y                              /  |  Y< ~-.__j",
  "     /   !                        _.--~T : l  l<  /.-~",
  "    /   /                 ____.--~ .   ` l /~\\ \\<|Y",
  "   /   /             .-~~\"        /| .    ',-~\\ \\L|",
  "  /   /             /     .^   \\ Y~Y \\.^>/l_   \"--'",
  " /   Y           .-\"(  .  l__  j_j l_/ /~_.-~    .",
  "Y    l          /    \\  )    ~~~.\" / `/\"~ / \\.__/l_",
  "|     \\     _.-\"      ~-{__     l  :  l._Z~-.___.--~",
  "|      ~---~           /   ~~\"---\\_  ' __[>",
  "l  .                _.^   ___     _>-y~",
  " \\  \\     .      .-~   .-~   ~>--\"  /",
  "  \\  ~---\"            /     ./  _.-'",
  "   \"-.,_____.,_  _.--~\\     _.-~",
  "               ~~     (   _}       -Row",
  "                      `. ~(",
  "                        )  \\",
  "                  /,`--'~\\--'~\\",
  "                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"
      />
      <div className="relative w-full overflow-x-auto">
        <pre
          role="img"
          aria-label="Dinossauro em ASCII art"
          className="mx-auto w-max font-mono text-[0.45rem] leading-[1.15] text-primary sm:text-[0.6rem] md:text-xs lg:text-sm"
        >
          {DINO_LINES.join("\n")}
        </pre>
      </div>
    </main>
  );
}
