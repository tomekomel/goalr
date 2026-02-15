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

    const { goal, daysSinceCreated, daysUntilDeadline, siblingGoalsSummary, locale } = await req.json();

    if (!goal || !["to-do", "in-progress"].includes(goal.status)) {
      return new Response(
        JSON.stringify({ error: "Goal must have status to-do or in-progress" }),
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

    const lang = locale === "pl" ? "Polish" : "English";

    const systemPrompt = `You are a concise goal coach. Analyze the goal and provide a short, actionable coaching message (2-4 sentences max). Respond in ${lang}.

Context rules based on goal state:
- If status is "to-do" and daysSinceCreated > 3: The goal is stale. Nudge with ONE concrete first step that takes 15 minutes or less.
- If status is "to-do" and daysSinceCreated <= 3: Fresh goal. Suggest a specific first action step.
- If status is "in-progress" and progress < 30% and daysUntilDeadline < 7: AT RISK. Offer 3 brief options: reduce scope, move deadline, or sprint to finish.
- If status is "in-progress" and progress >= 30%: Encourage progress. Estimate completion pace and suggest one way to accelerate.
- If siblingGoalsSummary.inProgress > 3: Too many goals in progress. Suggest focusing on fewer goals.

Return ONLY a JSON object (no markdown fences):
{
  "message": "Your coaching message here",
  "riskLevel": "none" | "low" | "high"
}

Risk level rules:
- "high": in-progress + progress < 30% + deadline < 7 days, OR to-do + stale > 7 days
- "low": to-do + stale 3-7 days, OR in-progress + progress < 50% + deadline < 14 days
- "none": everything else`;

    const userMessage = `Goal: "${goal.title}"
Description: "${goal.description || "No description"}"
Status: ${goal.status}
Progress: ${goal.progress}%
Period: ${goal.period}
Days since created: ${daysSinceCreated}
Days until deadline: ${daysUntilDeadline ?? "no deadline"}
Sibling goals: ${siblingGoalsSummary.total} total, ${siblingGoalsSummary.inProgress} in progress, ${siblingGoalsSummary.done} done`;

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
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get coaching" }),
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

    return new Response(
      JSON.stringify({
        message: parsed.message,
        riskLevel: parsed.riskLevel || "none",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
