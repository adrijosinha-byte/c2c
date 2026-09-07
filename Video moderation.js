const videoFile = await gemini.files.upload({
  file: videoPath,
  config: {
    mimeType: "video/mp4"
  }
});

let processed = await gemini.files.get({
  name: videoFile.name
});

while (processed.state === "PROCESSING") {

  await new Promise(
    resolve => setTimeout(resolve, 2000)
  );

  processed = await gemini.files.get({
    name: videoFile.name
  });
}

if (processed.state === "FAILED") {
  throw new Error("Video processing failed");
}

const result = await gemini.interactions.create({

  model: "gemini-3.8-flash",

  input: [

    {
      type: "video",

      uri: processed.uri,

      mime_type: processed.mimeType
    },

    {
      type: "text",

      text: `
      Check this video for prohibited
      sexually explicit or unsafe content.

      Return a JSON moderation decision.
      `
    }
  ]
});