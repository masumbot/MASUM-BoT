module.exports.run = async ({ api, args, event }) => {
  try {
    const keyword = args.join(" ").trim();

    if (!keyword) {
      return api.sendMessage(
        "ব্যবহার:\n/song <গানের নাম>",
        event.threadID,
        event.messageID
      );
    }

    // প্রথমে গান সার্চ
    const search = await axios.get(
      `${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyword)}`
    );

    if (!search.data || search.data.length === 0) {
      return api.sendMessage(
        "❌ কোনো গান পাওয়া যায়নি।",
        event.threadID,
        event.messageID
      );
    }

    // প্রথম রেজাল্ট নাও
    const first = search.data[0];

    // এখন MP3 লিংক আনো
    const audio = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${first.id}&format=mp3`
    );

    const { title, quality, downloadLink } = audio.data;

    return api.sendMessage(
      {
        body: `🎵 ${title}\n🎧 ${quality}`,
        attachment: await dipto(downloadLink, "audio.mp3")
      },
      event.threadID,
      () => fs.unlinkSync("audio.mp3"),
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage(
      "❌ গান আনতে সমস্যা হয়েছে।",
      event.threadID,
      event.messageID
    );
  }
};
