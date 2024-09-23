import { google } from "googleapis";

export const searchYoutube = async (channelId) => {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env["GOOGLE_API_KEY"] ?? "",
  });

  let allVideos = [];
  const fetchVideos = async (pageToken) => {
    const searchRes = await youtube.search.list({
      part: ["snippet"],
      relevanceLanguage: "ja",
      type: ["video"],
      channelId: channelId,
      order: "date",
      eventType: "completed",
      maxResults: 50,
      pageToken: pageToken,
    });

    allVideos = [...allVideos, ...searchRes.data.items];

    if (searchRes.data.nextPageToken) {
      await fetchVideos(searchRes.data.nextPageToken);
    }
  };

  await fetchVideos("");

  return allVideos;
};

export const youtubePlaylist = async () => {
  const res = await searchYoutube(process.env["YOUTUBE_CHANNEL_ID"] ?? "");
  const videoIds = res.map((video) => video.id.videoId);
  return videoIds;
};
