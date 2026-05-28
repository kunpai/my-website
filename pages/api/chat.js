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
      // Clone the messages array and insert classification instructions
      const classificationMessages = [...messages];
      if (classificationMessages[0] && classificationMessages[0].role === 'system') {
        const originalSystemContent = classificationMessages[0].content;
        const contextIndex = originalSystemContent.indexOf('Context:');
        const contextSection = contextIndex !== -1 ? originalSystemContent.slice(contextIndex) : '';

        classificationMessages[0] = {
          role: 'system',
          content: `You are a relevance classifier. Analyze the context and the conversation history below. Determine if the user's latest query is related to Kunal Pai's background, research, publications, projects, education, career, skills, contact info, or standard chatbot greetings.\n\nOutput your response in the following format:\nThought: [one brief sentence explaining if it is related or unrelated]\nVerdict: [YES or NO]\n\n${contextSection}`
        };
      }

      // Use a fast classification call to determine relevance
      const classificationResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: classificationMessages,
          max_tokens: 45,
          temperature: 0.0,
        }),
      });

      if (classificationResponse.ok) {
        const classData = await classificationResponse.json();
        verdict = classData.choices?.[0]?.message?.content || 'YES';
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

    if (verdict.toUpperCase().includes('VERDICT: NO')) {
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
