import express from "express";
import https from "https";
import {
  getAccessToken,
  GraphApiQuery,
} from "@colorfullife/ms365-graph-api-auth";
require("dotenv").config();

const app = express();

app.get("/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const authResponse = await getAccessToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!,
    process.env.TENANT_ID!
  );
  if (!authResponse)
    return res.status(500).send({ error: "Could not get access token" });
  console.log({ authResponse });
  const query = new GraphApiQuery(authResponse.accessToken);
  const mySite = await query.getSites(process.env.SITE_NAME!);
  const drive = await query.getDrives(mySite.value[0].id);
  const image = await query.getDriveItemByFileName(
    mySite.value[0].id,
    drive.value[0].id,
    imageName
  );
  const imageDownloadUrl = image["@microsoft.graph.downloadUrl"];
  https
    .get(imageDownloadUrl, (response) => {
      // Set the response headers to indicate that this is an image file
      res.setHeader("Content-Type", "image/jpeg");
      // Pipe the file stream to the response object to serve the file as an image
      response.pipe(res);
    })
    .on("error", (err) => {
      console.log({ err: err.message });
      res.status(500).send("Cannot get image");
    });
});

app.get("/", async (req, res) => {
  const authResponse = await getAccessToken(
    process.env.CLIENT_ID!,
    process.env.CLIENT_SECRET!,
    process.env.TENANT_ID!
  );
  if (!authResponse)
    return res.status(500).send({ error: "Could not get access token" });

  const query = new GraphApiQuery(authResponse.accessToken);
  const mySite = await query.getSites(process.env.SITE_NAME!);
  const drive = await query.getDrives(mySite.value[0].id);
  const myItems = await query.getDriveItems(
    mySite.value[0].id,
    drive.value[0].id
  );
  res.send(`<body>
    ${myItems.value
      .map((item) => `<a href="/${item.name}">${item.name}</a>`)
      .join("<br/>")}
  </body>`);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
