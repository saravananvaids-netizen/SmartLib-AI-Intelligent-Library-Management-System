export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: string;
    previewLink?: string;
  };
}

export async function searchGoogleBooks(query: string, maxResults = 12): Promise<GoogleBookItem[]> {
  try {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Backend proxy failed, attempting direct Google Books call:', err);
    try {
      const direct = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      const directData = await direct.json();
      return directData.items || [];
    } catch (e) {
      console.error('All Google Books queries failed:', e);
      return [];
    }
  }
}

export interface RecommendationResult {
  title: string;
  author: string;
  subject: string;
  isbn: string;
  reason: string;
  keyInsight: string;
}

export async function getAiRecommendations(payload: {
  interests: string;
  department: string;
  favoriteSubjects: string;
  currentBooks: string;
}): Promise<{ fallback: boolean; recommendations: RecommendationResult[] }> {
  try {
    const res = await fetch('/api/gemini/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Recommendation request failed');
    return await res.json();
  } catch (err) {
    console.error('Recommendations error:', err);
    return {
      fallback: true,
      recommendations: [
        {
          title: 'Algorithms to Live By: The Computer Science of Human Decisions',
          author: 'Brian Christian and Tom Griffiths',
          subject: 'Decision Science & CS',
          isbn: '9781627790369',
          reason: 'Bridges computer science algorithmic paradigms with real-world human problem solving.',
          keyInsight: 'Optimal stopping, caching, and sorting principles apply directly to daily life.',
        },
        {
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          subject: 'Distributed Systems',
          isbn: '9781449373320',
          reason: 'Crucial for modern engineering students tackling cloud scalability.',
          keyInsight: 'Understand CAP theorem, replication lag, and consensus algorithms.',
        },
      ],
    };
  }
}

export interface SummaryResult {
  fallback: boolean;
  summary: string;
  keyTakeaways: string[];
  targetAudience: string;
  readTimeEstimate: string;
}

export async function getAiSummary(payload: {
  title: string;
  author: string;
  description: string;
}): Promise<SummaryResult> {
  try {
    const res = await fetch('/api/gemini/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Summarization request failed');
    return await res.json();
  } catch (err) {
    console.error('Summary error:', err);
    return {
      fallback: true,
      summary: `"${payload.title}" provides a deep, rigorous exploration of core domain concepts, balancing foundational academic theory with applied engineering problem-solving.`,
      keyTakeaways: [
        'Comprehensive breakdown of standard industry algorithms and paradigms.',
        'Extensive case analyses illustrating architectural trade-offs.',
        'Self-study problems crafted to develop academic mastery.',
      ],
      targetAudience: 'Undergraduate and Graduate Students',
      readTimeEstimate: '5-8 hours',
    };
  }
}

export async function askLibraryAssistant(payload: {
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  context: {
    inventory?: string;
    rules?: string;
    student?: { name: string; studentId: string; borrowedCount: number };
  };
}): Promise<{ fallback: boolean; reply: string }> {
  try {
    const res = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Assistant request failed');
    return await res.json();
  } catch (err) {
    console.error('Assistant error:', err);
    return {
      fallback: true,
      reply: 'The library circulation desk is available Mon-Fri 8:00 AM - 10:00 PM. Fines accrue at $0.50/day after the 14-day borrowing duration.',
    };
  }
}
