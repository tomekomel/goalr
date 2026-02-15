import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user via Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description, locale } = await req.json();

    if (!description || typeof description !== "string" || !description.trim()) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentWeek = Math.min(Math.ceil(now.getDate() / 7), 4);

    const systemPrompt = `You are a goal planning assistant. Given a user's goal description, break it down into a structured set of SMART goals across three time horizons.

Return ONLY a JSON object with a "goals" array. Each goal has:
- title (string, concise action-oriented title)
- description (string, 1 sentence with details)
- period ("yearly" | "monthly" | "weekly")
- weekNumber (1-4, only for weekly goals, omit for others)
- targetDate (YYYY-MM-DD, always 1st of the month)

Rules:
- Generate 1-2 yearly goals (the big picture)
- Generate 2-4 monthly goals (for current and next months)
- Generate 4-8 weekly goals (for current month, spread across weeks 1-4)
- Weekly goals should be concrete, actionable small steps
- Monthly goals should be measurable milestones
- Yearly goals for current year: ${now.getFullYear()}, use targetDate ${now.getFullYear()}-01-01
- Monthly goals: use targetDate with 1st of the relevant month
- Weekly goals: use targetDate ${currentMonth}-01, and set weekNumber (current week is ${currentWeek})
- Current date: ${currentDate}
- Respond in the same language as the user's input
- Return valid JSON only, no markdown fences`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: description },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate goals" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the JSON response (handle potential markdown fences)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ goals: parsed.goals || parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
