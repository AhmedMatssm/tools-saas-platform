import axios from "axios"

export interface GenerationConfig {
  prompt: string
  model?: "fast" | "quality" | "creative"
  num_steps?: number
  guidance?: number
}

const MODELS = {
  fast: "@cf/bytedance/stable-diffusion-xl-lightning",
  quality: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  creative: "@cf/lykon/dreamshaper-8-lcm",
}

export const generateImage = async ({ prompt, model = "fast", num_steps = 20, guidance = 7.5 }: GenerationConfig) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const modelId = MODELS[model]

  if (!accountId || !apiToken) {
    throw new Error("Missing Cloudflare credentials")
  }

  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`,
    { prompt, num_steps, guidance },
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer", // For image data
    }
  )

  return Buffer.from(response.data)
}
