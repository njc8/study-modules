/* Cloudflare Worker entry. Deploy from this folder:
     npx wrangler login
     npx wrangler secret put OPENROUTER_API_KEY
     npx wrangler deploy
   Then put the printed https://....workers.dev URL into HOSTED_ENDPOINT at the top of assets/chat.js. */
import {createHandler} from './handler.js';
export default {
  fetch(request,env){return createHandler(env)(request);}
};
