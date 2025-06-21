// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image',
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const base64Image = response.data.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Stability AI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stability server running at http://localhost:${PORT}`);
});

