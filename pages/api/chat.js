export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Guard to ensure the query is related to Kunal Pai's portfolio, skills, or experience
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'NVIDIA API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const query = lastUserMessage.toLowerCase();
    const words = query.trim().split(/\s+/);
    const isGreetingOrShort = words.length <= 2;

    let verdict = 'YES';
    try {
      // Use a fast, 1-token classification call to determine relevance
      const classificationResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [
            {
              role: 'system',
              content: "Determine if the user query is directly related to Kunal Pai (the website owner), his research, publications, software projects, work/teaching experience, skills, education, contact info, or standard chatbot greetings. If it is related, output YES. If it is unrelated (e.g. general knowledge, recipes, unrelated coding help, math, essays), output NO. Output ONLY YES or NO."
            },
            {
              role: 'user',
              content: `Query: "${lastUserMessage}"`
            }
          ],
          max_tokens: 3,
          temperature: 0.0,
        }),
      });

      if (classificationResponse.ok) {
        const classData = await classificationResponse.json();
        verdict = classData.choices?.[0]?.message?.content?.trim() || 'YES';
      } else {
        throw new Error(`Classification call returned status ${classificationResponse.status}`);
      }
    } catch (e) {
      console.warn("Classification call failed, using heuristic regex fallback", e);
      
      // Heuristic fallback check if API fails
      const keywords = [
        'kunal', 'pai', 'ucla', 'uc davis', 'davis', 'phd', 'master', 'advisor', 
        'research', 'paper', 'publication', 'project', 'experience', 'work', 
        'job', 'intern', 'skill', 'resume', 'cv', 'email', 'contact', 'git', 
        'linkedin', 'portfolio', 'website', 'thesis', 'agent', 'gem5', 'naamse', 
        'ispass', 'iclr', 'icml', 'msr', 'seal', 'miryung', 'kim', 'academic', 
        'student', 'gpa', 'course', 'class', 'teach', 'ecs 132', 'ecs', 'award',
        'hi', 'hello', 'hey', 'yo', 'greetings', 'help', 'introduce', 'about',
        'who is', 'who are', 'who was', 'what is', 'what are', 'where did', 'tell me'
      ];
      const hasKeyword = keywords.some(keyword => {
        const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        return regex.test(query);
      });
      if (!isGreetingOrShort && !hasKeyword) {
        verdict = 'NO';
      }
    }

    if (verdict.toUpperCase().includes('NO')) {
      return new Response(
        JSON.stringify({ 
          error: "I can only answer questions related to Kunal Pai's portfolio, research, experience, or skills. Please ask a relevant question!" 
        }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: messages,
        stream: true,
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `NVIDIA API error: ${errorText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the response body directly to stream it to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
