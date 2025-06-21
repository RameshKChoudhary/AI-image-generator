import { useState, useEffect } from 'react';
import './app.css';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');

  // Check API connectivity on load
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('https://api.stability.ai/v1/user/balance', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer (api)'
          }
        });
        
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
          console.error('API connection test failed:', response.status);
        }
      } catch (err) {
        setApiStatus('error');
        console.error('API connection error:', err);
      }
    }
    
    checkApiStatus();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Create the request payload
      const requestData = {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      };
      
      console.log('Sending request to Stability API with payload:', requestData);
      
      // You might need a proxy server or backend to avoid CORS issues
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer (your api key)'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, just use the HTTP status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.artifacts && data.artifacts.length > 0 && data.artifacts[0].base64) {
        setImageUrl(`data:image/png;base64,${data.artifacts[0].base64}`);
      } else {
        throw new Error('No image data received from API');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Network error: Could not connect to the API. This may be due to CORS restrictions when running locally.');
      } else {
        setError(error.message || 'Failed to generate image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="wow">
      <h1 className="text-3xl font-bold mb-6">Indian's AI Image Generator</h1>
      
     <div id='wow3' >
      
      <div id='wow2' className="w-full flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          placeholder="Enter a prompt for image generation"
          disabled={loading}
          className="flex-1 p-3 border border-gray-300 rounded padd-right"
          autoFocus
        />
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-600 mb-4">Generating your image...</p>}
      
      {imageUrl && (
        <div className="mt-6 border border-gray-200 rounded p-4">
          <img src={imageUrl} alt="Generated" className="max-w-full h-auto rounded" />
        </div>
      )}
      
      </div>
    </div>
  );
}