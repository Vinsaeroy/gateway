const menus = {
  game: h => `
${h}
╭─❒ 𝗚𝗔𝗠𝗘
│ • .tebakkata
│ • .tebakmakanan
│ • .tebaklogo
│ • .tebakjkt48
│ • .asahotak
│ • .kuismerdeka
│ • .tebaktebakan
│ • .tebakkimia
│ • .tebakgambar
│ • .tebaklirik
│ • .tebakpemainbola
│ • .susunkata
│ • .math
╰────────────❒
`,

  store: h => `
${h}
╭─❒ 𝗦𝗧𝗢𝗥𝗘
│ • .addlist
│ • .list
│ • .dellist
│ • .pay
│ • .proses
│ • .done
│ • .jaser
│ • .stopjaser
│ • .jpmswgc
╰────────────❒
`,

  downloader: h => `
${h}
╭─❒ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥
│ • .aio
│ • .tt
│ • .ttmp3
│ • .ttfoto
│ • .ig
│ • .fb
│ • .ytvid
│ • .ytaud
│ • .ytmp3
│ • .ytmp4
│ • .spotify
│ • .mediafire
│ • .gdrive
│ • .capcut
│ • .videy
│ • .gitclone
│ • .pindl
│ • .threads
│ • .snackvideo
│ • .mega
│ • .x
│ • .sfile
│ • .douyin
│ • .soundcloud
╰────────────❒
`,

  ai: h => `
${h}
╭─❒ 𝗔𝗜
│ • .metaai
│ • .ai
│ • .claude
│ • .ai4
│ • .gemini
│ • .copilot
│ • .wormgpt
│ • .deepseek
│ • .yp
│ • .gpt5
│ • .webpilot
│ • .gpt
│ • .speechwriter
│ • .cici
│ • .gita
│ • .aig
│ • .cimg
│ • .felo
│ • .flux
│ • .fluxhd
│ • .imgedit
│ • .ainagi
│ • .aiwaguri
│ • .aielaina
│ • .aigojo
│ • .aitoji
│ • .airaiden
│ • .muslimai
│ • .jeeves
│ • .lumin
│ • .turboseek
╰────────────❒
`,

  stalker: h => `
${h}
╭─❒ 𝗦𝗧𝗔𝗟𝗞𝗘𝗥
│ • .igstalk
│ • .ttstalk
│ • .stalkwa
│ • .stalkff
│ • .stalkgc
│ • .ghstalk
╰────────────❒
`,

  rpg: h => `
${h}
╭─❒ 𝗥𝗣𝗚 𝗠𝗘𝗡𝗨
│ • .profile
│ • .slot
│ • .inventory
│ • .rename <nama>
│ • .toprpg
│ • .klaim
│ • .kerja
│ • .adventure
│ • .dungeon
│ • .berburu
│ • .berkebun
│ • .tanam <bibit>
│ • .panen
│ • .mulung
│ • .memancing
│ • .memancing bait
│ • .rod
│ • .upgraderod
│ • .menambang
│ • .opencrate <1-10>
│ • .pasar
│ • .jual <item> <jumlah|all>
│ • .craft list
│ • .craft make <item> <jumlah>
│ • .bank
│ • .shop
│ • .use <item> <jumlah>
│ • .upgrade <weapon|armor|luck>
│ • .pet
│ • .transfer @user <jumlah>
│ • .merampok @user
│ • .begal @user
╰────────────❒
`,

  panel: h => `
${h}
╭─❒ 𝗣𝗔𝗡𝗘𝗟
│ • .1gb
│ • .2gb
│ • .3gb
│ • .4gb
│ • .5gb
│ • .6gb
│ • .7gb
│ • .8gb
│ • .9gb
│ • .10gb
│ • .unli
│ • .cadmin
│ • .listserver
│ • .delserver
╰────────────❒
`,

  group: h => `
${h}
╭─❒ 𝗚𝗥𝗢𝗨𝗣
│ • .tagall
│ • .h
│ • .afk
│ • .revoke
│ • .linkgc
│ • .gcinfo
│ • .antilinkgb
│ • .antisticker
│ • .antitagsw
│ • .antiswgc
│ • .antitoxic
│ • .warns
│ • .clearwarn
│ • .acc
│ • .reject
│ • .setnamagc
│ • .upswgc
│ • .setppgc
│ • .setwelcome
│ • .setleave
│ • .welcome
│ • .leave
│ • .kick
│ • .add
│ • .addwarn
│ • .delwarn
│ • .promote
│ • .demote
│ • .tagme
╰────────────❒
`,

  maker: h => `
${h}
╭─❒ 𝗠𝗔𝗞𝗘𝗥
│ • .snapcode
│ • .nulis
│ • .ais
│ • .wasted
│ • .iqc
│ • .qc
│ • .brat
│ • .brathd
│ • .smeme
│ • .bratvid
│ • .ytcomment
│ • .fakecall
│ • .fakedana
│ • .fakewa
│ • .fakexnxx
│ • .fakestory
│ • .fakeml
│ • .fakedev1
│ • .fakedev2
│ • .fakedev3
│ • .mpls
│ • .lobbyffmax
│ • .emojigif
│ • .emojimix
│ • .bratanime
│ • .ustad
│ • .glitchtext
│ • .writetext
│ • .advancedglow
│ • .typographytext
│ • .pixelglitch
│ • .neonglitch
│ • .flagtext
│ • .flag3dtext
│ • .deletingtext
│ • .blackpinkstyle
│ • .glowingtext
│ • .underwatertext
│ • .logomaker
│ • .cartoonstyle
│ • .papercutstyle
│ • .watercolortext
│ • .effectclouds
│ • .blackpinklogo
│ • .gradienttext
│ • .summerbeach
│ • .luxurygold
│ • .multicoloyellowneon
│ • .sandsummer
│ • .galaxywallpaper
│ • .1917style
│ • .makingneon
│ • .royaltext
│ • .freecreate
│ • .galaxystyle
│ • .lighteffects
╰────────────❒
`,

  fun: h => `
${h}
╭─❒ 𝗙𝗨𝗡
│ • .artinama
│ • .tafsirmimpi
│ • .jodoh
│ • .tanggaljadi
│ • .watakartis
│ • .ramalanjodoh
│ • .rejekiweton
│ • .kecocokannama
│ • .haribaik
│ • .harilarangan
│ • .kerang
│ • .cekgay
│ • .cekfemboy
│ • .cekcantik
│ • .cekganteng
│ • .jadian
│ • .wibu
│ • .anjing
│ • .tolol
│ • .setan
│ • .iblis
│ • .puki
│ • .dakjal
│ • .sangean
│ • .geserbumi
│ • .cekazab
│ • .ramalan
│ • .tebakumur
│ • .kapankah
│ • .bisakah
│ • .seberapagila
│ • .dimanakah
│ • .bagaimanakah
│ • .rate
╰────────────❒
`,

  music: h => `
${h}
╭─❒ 𝗠𝗨𝗦𝗜𝗖
│ • .sad1-sad55
│ • .sound1-sound250
│ • .letdown
│ • .tabolabale
│ • .jamterbang
│ • .suratcintauntukstarla
│ • .cintasejati
│ • .perunggu
│ • .matame
│ • .bringmetolife
│ • .mangu
│ • .mimosa
│ • .happynation
│ • .multo
│ • .duka
│ • .peradaban
│ • .montagemrugada
│ • .nobatidao
│ • .ourstokeep
│ • .bestfriend
│ • .thenightwemeet
│ • .nina
│ • .blueyungkai
╰────────────❒
`,

  islamic: h => `
${h}
╭─❒ 𝗜𝗦𝗟𝗔𝗠𝗜𝗖
│ • .quotesislam
│ • .jadwalsholat
│ • .asmaulhusna
│ • .doaharian
│ • .dzikirpagi
│ • .dzikirmalam
│ • .istighfar
│ • .surah
│ • .listsurah
│ • .autosholat
│ • .tafsirsurah
│ • .ayatkursi
╰────────────❒
`,

  kristen: h => `
${h}
╭─❒ 𝗞𝗥𝗜𝗦𝗧𝗘𝗡
│ • .renunganharian
│ • .quoteskristen
│ • .faktaunikkristen
│ • .alkitab
│ • .bacaan
│ • .cariayat
╰────────────❒
`,

  random: h => `
${h}
╭─❒ 𝗥𝗔𝗡𝗗𝗢𝗠
│ • .horor
│ • .dongeng
│ • .memedakwah
│ • .quotes
│ • .quotesbucin
│ • .quotesanime
│ • .katagalau
│ • .katabijak
│ • .preset
│ • .animeselfie
│ • .charanime
│ • .faktaunik
│ • .animehug
│ • .animecry
│ • .animekiss
│ • .neko
│ • .namamlbb
│ • .namaff
│ • .pantun
│ • .puisi
│ • .furina
│ • .hutao
│ • .uma
│ • .blackhole
│ • .puncakgunung
│ • .waguri
│ • .wuwa
│ • .mahiru
│ • .tsunade
│ • .mikasa
│ • .eren
│ • .gojo
│ • .sasuke
│ • .loli
│ • .lolianime
│ • .waifu
│ • .husbu
│ • .cat
│ • .oppai
│ • .cosplay
│ • .pap
│ • .ba
│ • .fanart
│ • .cecan
│ • .cecan-korea
│ • .cecan-vietnam
│ • .cecan-china
│ • .cogan
│ • .hijab
│ • .ppcp
│ • .walpaper
│ • .tiktoknotnot
│ • .tiktokkayes
│ • .tiktokbocil
│ • .hijaber
│ • .jeni
│ • .jiso
│ • .justina
│ • .rose
│ • .ryujin
│ • .tobrut
│ • .asupandouyin
│ • .asupandouyinvid
│ • .chindo
│ • .resepharian
│ • .storyjomok
│ • .meme
╰────────────❒
`,

  tools: h => `
${h}
╭─❒ 𝗧𝗢𝗢𝗟𝗦
│ • .ceklimit
│ • .s
│ • .wm
│ • .upvidey
│ • .rvo
│ • .hd
│ • .hdvid
│ • .ocr
│ • .waparse
│ • .nglsubmit
│ • .nglspam
│ • .npmsearch
│ • .gethtml
│ • .topixel
│ • .kompresfoto
│ • .imgbb
│ • .tourl
│ • .link2qr
│ • .top4top
│ • .tovn
│ • .tomp3
│ • .toptv
│ • .toimg
│ • .tovid
│ • .gempa
│ • .getpastebin
│ • .cekid
│ • .cekidch
│ • .cekidgc
│ • .cekip
│ • .pin
│ • .pingeser
│ • .pixiv
│ • .gimage
│ • .lirik
│ • .spotifysearch
│ • .kodepos
│ • .news
│ • .cnn
│ • .getpp
│ • .ttsearch
│ • .play
│ • .yts
│ • .removebg
│ • .hitamkan
│ • .ssweb
│ • .bstation
│ • .toanime
│ • .toghibli
│ • .ceklid
│ • .cekjid
│ • .chatid
│ • .genpass
│ • .uuid
│ • .enc64
│ • .dec64
│ • .txt2biner
│ • .biner2txt
│ • .lorem
│ • .morse
│ • .unmorse
│ • .encjs
│ • .tofile
│ • .tambah
│ • .kurang
│ • .bagi
│ • .kali
│ • .bass
│ • .blown
│ • .chipmunk
│ • .deep
│ • .earrape
│ • .fast
│ • .fat
│ • .nightcore
│ • .reverse
│ • .robot
│ • .slow
│ • .smooth
│ • .topanime
│ • .animesearch
│ • .komikindo
│ • .whatanime
│ • .crypto
│ • .wiki
│ • .kbbi
│ • .novel
│ • .wattpad
│ • .playstore
│ • .promptjailbreakmetaai
╰────────────❒
`,

  owner: h => `
${h}
╭─❒ 𝗢𝗪𝗡𝗘𝗥
│ • .ping
│ • .get
│ • .self
│ • .public
│ • .grouponly
│ • .mute
│ • .backup
│ • .setpp
│ • .delppbot
│ • .setnama
│ • .sewa
│ • .ceksewa
│ • .delsewa
│ • .ban
│ • .unban
│ • .addowner
│ • .delowner
│ • .addprem
│ • .delprem
│ • .addlimit
│ • .addplugin
│ • .delplugin
│ • .join
│ • .out
│ • .listgc
│ • .restart
│ • .stopbot
│ • .clearsesi
│ • .clearcache
│ • .getcase
│ • .gp
│ • =>
│ • >>
│ • $
╰────────────❒
`
}

export default menus