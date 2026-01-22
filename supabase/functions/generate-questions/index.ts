// Supabase Edge Function: Generate Questions using AI
// Triggered when user has seen > 80% of questions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedQuestion {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  image_query?: string; // Search query for Unsplash
}

// Categories with their themes for question generation
const CATEGORIES = {
  history: {
    name: "History",
    themes: ["World Wars", "Ancient civilizations", "Famous leaders", "Historical events", "Revolutions"],
  },
  geography: {
    name: "Geography",
    themes: ["Capital cities", "Mountains", "Rivers", "Countries", "Landmarks"],
  },
  science: {
    name: "Science",
    themes: ["Physics", "Chemistry", "Biology", "Space", "Inventions"],
  },
  sports: {
    name: "Sports",
    themes: ["Football", "Olympics", "Basketball", "Tennis", "World records"],
  },
  entertainment: {
    name: "Entertainment",
    themes: ["Movies", "Music", "TV shows", "Celebrities", "Awards"],
  },
  technology: {
    name: "Technology",
    themes: ["Computers", "Internet", "Smartphones", "AI", "Gaming"],
  },
  food: {
    name: "Food & Drink",
    themes: ["Cuisines", "Ingredients", "Cooking", "Beverages", "Restaurants"],
  },
  art: {
    name: "Art",
    themes: ["Famous painters", "Art movements", "Sculptures", "Museums", "Art history"],
  },
  music: {
    name: "Music",
    themes: ["Classical composers", "Rock bands", "Pop artists", "Musical instruments", "Music history"],
  },
  animals: {
    name: "Animals",
    themes: ["Mammals", "Birds", "Marine life", "Endangered species", "Animal behavior"],
  },
  nature: {
    name: "Nature",
    themes: ["Plants", "Ecosystems", "Weather", "Natural wonders", "Environment"],
  },
  literature: {
    name: "Literature",
    themes: ["Classic novels", "Famous authors", "Poetry", "Plays", "Literary awards"],
  },
  movies: {
    name: "Movies",
    themes: ["Oscar winners", "Directors", "Classic films", "Actors", "Film genres"],
  },
};

// Fetch image from Unsplash
async function fetchUnsplashImage(query: string): Promise<{ url: string; credit: string } | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.regular,
        credit: `Photo by ${photo.user.name} on Unsplash`,
      };
    }
  } catch (error) {
    console.error("Unsplash error:", error);
  }

  return null;
}

// Generate questions using OpenAI
async function generateQuestionsWithAI(
  category: string,
  count: number = 10,
  language: string = "en"
): Promise<GeneratedQuestion[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!categoryInfo) {
    throw new Error(`Unknown category: ${category}`);
  }

  const prompt = `Generate ${count} trivia questions for a quiz app in the "${categoryInfo.name}" category.

Themes to cover: ${categoryInfo.themes.join(", ")}

Requirements:
- Questions should be in ${language === "fr" ? "French" : "English"}
- Mix of difficulty levels (1=easy, 2=medium, 3=hard)
- Each question needs exactly 1 correct answer and 3 wrong answers
- Wrong answers should be plausible but clearly incorrect
- For questions that would benefit from an image, include an image_query field with a relevant Unsplash search term
- Only include image_query for questions about visual subjects (landmarks, people, objects, places)

Return a JSON array with this exact structure:
[
  {
    "question_text": "Question here?",
    "correct_answer": "Correct answer",
    "wrong_answers": ["Wrong 1", "Wrong 2", "Wrong 3"],
    "category": "${category}",
    "difficulty": 1,
    "image_query": "optional search term for unsplash"
  }
]

Only return valid JSON, no other text.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a trivia question generator. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  // Parse the JSON response
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse AI response as JSON");
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { user_id, category, count = 10, language = "en" } = await req.json();

    // Verify user and check if they need new questions
    if (user_id) {
      const { data: stats } = await supabase.rpc("get_user_question_stats", {
        p_user_id: user_id,
      });

      if (stats && stats.length > 0 && !stats[0].needs_new_questions) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User has not seen enough questions yet",
            coverage_percent: stats[0].coverage_percent,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Generate questions for the category (or random if not specified)
    const targetCategory = category || Object.keys(CATEGORIES)[Math.floor(Math.random() * Object.keys(CATEGORIES).length)];

    console.log(`Generating ${count} questions for category: ${targetCategory}`);

    const generatedQuestions = await generateQuestionsWithAI(targetCategory, count, language);

    // Fetch images for questions that have image_query
    const questionsWithImages = await Promise.all(
      generatedQuestions.map(async (q) => {
        let image_url = null;
        let image_credit = null;

        if (q.image_query) {
          const image = await fetchUnsplashImage(q.image_query);
          if (image) {
            image_url = image.url;
            image_credit = image.credit;
          }
        }

        return {
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers,
          category: q.category,
          difficulty: q.difficulty,
          language,
          is_active: true,
          image_url,
          image_credit,
        };
      })
    );

    // Insert questions into database
    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsWithImages)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert questions: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${insertedQuestions?.length || 0} new questions`,
        questions: insertedQuestions,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
