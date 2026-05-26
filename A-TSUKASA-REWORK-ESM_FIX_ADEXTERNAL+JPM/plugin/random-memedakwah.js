export const command = ["memedakwah"];

export default async function (m, { reply, riz, id, qriz }) {
    const links = [
        "https://i.ibb.co.com/mrGn6K4c/1765521646723.jpg",
        "https://i.ibb.co.com/8DV3p0xT/1765521349005.jpg",
        "https://i.ibb.co.com/NdNmXJr3/1765521359190.jpg",
        "https://i.ibb.co.com/4wks0FHK/1765521364643.jpg",
        "https://i.ibb.co.com/nsSTqcpP/1765521375138.jpg",
        "https://i.ibb.co.com/Qj8QD2QW/1765521381709.jpg",
        "https://i.ibb.co.com/4w6rPB7w/1765521402094.jpg",
        "https://i.ibb.co.com/wZWfZ0Y6/1765521391115.jpg",
        "https://i.ibb.co.com/tGxyZVR/1765521395073.jpg",
        "https://i.ibb.co.com/7JPwLWPZ/1765521409925.jpg",
        "https://i.ibb.co.com/bjG4ZFTT/1765521425928.jpg",
        "https://i.ibb.co.com/7JMzNQhw/1765521405715.jpg",
        "https://i.ibb.co.com/qM07zMgd/1765521419615.jpg",
        "https://i.ibb.co.com/rK6wy1D5/1765521613800.jpg",
        "https://i.pinimg.com/originals/ee/78/a3/ee78a3e370c7faf957fd07a4223fe34a.jpg",
        "https://i.pinimg.com/originals/ee/a8/7e/eea87efaff95e114b9e1fdab134233c4.jpg",
        "https://i.pinimg.com/originals/5b/0a/16/5b0a16d88e4c5a667a48b28ad00516ff.jpg",
        "https://i.pinimg.com/originals/db/5a/cd/db5acdfde9f2bdeaa3626c7a3ef93762.jpg",
        "https://i.pinimg.com/originals/c7/23/66/c723666505ddc36f14c2ad189c68183a.jpg",
        "https://i.pinimg.com/originals/2d/83/0e/2d830e827be20e126e483c27ca77d465.jpg",
        "https://i.pinimg.com/originals/ee/52/6b/ee526b63b19bc9800248ea791f874c5f.jpg",
        "https://i.pinimg.com/originals/ab/11/cc/ab11ccc5f62343f1cd96782a23419612.jpg",
        "https://i.pinimg.com/originals/68/4c/ea/684cea7fa7effbd46f43c12a0df095f1.jpg",
        "https://i.pinimg.com/originals/2e/1b/fa/2e1bfa877527fca24487df3cf4687f35.jpg",
        "https://i.pinimg.com/originals/48/3b/25/483b25c3535dbf2ee348da631ab5bd72.jpg",
        "https://i.pinimg.com/originals/ad/eb/23/adeb2347646ff6188c49e2be3f3e151f.jpg"
    ];

    const r = links[Math.floor(Math.random() * links.length)];
    await riz.sendMessage(
        id,
        {
            image: { url: r }
        },
        { quoted: qriz }
    );
}
