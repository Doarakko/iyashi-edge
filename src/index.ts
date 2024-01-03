import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { Animal } from "./animal"

export type Env = SlackEdgeAppEnv & {
  DB: D1Database;
  ANIMAL_PREDICTION_API: string;
  ANIMAL_PREDICTION_API_KEY: string;
  IMAGE_UPLOADED_CHANNEL: string;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env });
    const animal = new Animal(env.DB, env.SLACK_BOT_TOKEN || "", env.ANIMAL_PREDICTION_API, env.ANIMAL_PREDICTION_API_KEY);

    app.event("app_mention", async ({ context }) => {
      const url = await animal.getByRandom();
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    });

    app.message("iyashi", async ({ context }) => {
      const url = await animal.getByRandom();
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.message(/わんわん|ワンワン/, async ({ context }) => {
      const url = await animal.getByAnimal("dog");
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.message(/にゃーん|ニャーン/, async ({ context }) => {
      const url = await animal.getByAnimal("cat");
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.message(/チンチラ|ちんちら/, async ({ context }) => {
      const url = await animal.getByAnimal("chinchilla");
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.message(/ハリネズミ|はりねずみ/, async ({ context }) => {
      const url = await animal.getByAnimal("hedgehog");
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.message(/フクロウ|ふくろう|ほーほー|ホーホー/, async ({ context }) => {
      const url = await animal.getByAnimal("owl");
      await context.client.chat.postMessage({ text: url, channel: context.channelId, unfurl_links: true, unfurl_media: true });
    })

    app.event("file_shared", async ({ context, payload}) => {
      const channelId = payload.channel_id
      if(channelId !== env.IMAGE_UPLOADED_CHANNEL){
        return;
      }

      const fileRes = await context.client.files.info({file: payload.file_id});
      if(!fileRes) {
        return;
      }

      // const shares = fileRes.file?.shares?.private;
      const shares = fileRes.file?.shares?.public;
      let messageTs = "";
      for (const sharesKey in shares) {
        if (shares[sharesKey][0].ts) {
          messageTs = shares[sharesKey][0].ts || "";
        }
      }
      if (!messageTs){
        return;
      }

      const permalinkRes = await context.client.chat.getPermalink({
        channel: channelId,
        message_ts: messageTs,
      });
      const permalink = permalinkRes.permalink;
      if (!permalink) {
        return;
      }

      const fileUrl = fileRes.file?.url_private_download;
      if(!fileUrl){
        return;
      }

      const label = await animal.predict(fileUrl);
      try {
        await animal.AddAnimal(permalink, label)
      } catch (e) {
        return;
      }

      await context.client.reactions.add({name: animal.getEmoji(label), channel: channelId, timestamp: messageTs})
    })
    
    return await app.run(request, ctx);
  },
};
