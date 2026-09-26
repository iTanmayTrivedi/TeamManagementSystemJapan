const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Task = { title: string; status: string; priority: string; due_date: string | null; assigned_to: string | null };
type Log = { details: string | null };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const type = body?.type;
    const lang = body?.language === "ja" ? "ja" : "en";
    if (!["summary", "priority", "activity"].includes(type)) {
      return json({ error: "Invalid type. Use: summary, priority, or activity" }, 400);
    }

    const tasks: Task[] = Array.isArray(body?.tasks) ? body.tasks.slice(0, 200) : [];
    const logs: Log[] = Array.isArray(body?.logs) ? body.logs.slice(0, 30) : [];
    const profileMap: Record<string, string> =
      body?.profiles && typeof body.profiles === "object" ? body.profiles : {};
    const who = (id: string | null) => (id && profileMap[id]) || "unassigned";

    const now = new Date();
    const overdue = tasks.filter((t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < now);
    const count = (s: string) => tasks.filter((t) => t.status === s).length;
    const taskSummary = `Total tasks: ${tasks.length}, Completed: ${count("completed")}, Overdue: ${overdue.length}, Pending: ${count("pending")}, In Progress: ${count("in_progress")}.`;
    const overdueList = overdue.map((t) => `- "${t.title}" (priority: ${t.priority}, due: ${t.due_date}, assigned to: ${who(t.assigned_to)})`).join("\n");
    const incomplete = tasks.filter((t) => t.status !== "completed")
      .map((t) => `- "${t.title}" (priority: ${t.priority}, status: ${t.status}, due: ${t.due_date ?? "none"}, assigned to: ${who(t.assigned_to)})`).join("\n");
    const recentActivity = logs.slice(0, 10).map((l) => `- ${l.details}`).join("\n");

    const langNote = lang === "ja" ? " 必ず日本語で回答してください。" : " Respond in English.";
    let systemPrompt = "";
    let userPrompt = "";
    if (type === "summary") {
      systemPrompt = "You are an expert task management AI. Create a concise daily summary in Markdown using short bullet points. Be direct and actionable." + langNote;
      userPrompt = `Data:\n${taskSummary}\n\nOverdue tasks:\n${overdueList || "None"}\n\nRecent activity:\n${recentActivity || "None"}\n\nGive a brief summary with highlights and concerns.`;
    } else if (type === "priority") {
      systemPrompt = "You are a task prioritization expert. Rank tasks needing attention by deadline, priority and status. Use a Markdown numbered list with a one-line reason each." + langNote;
      userPrompt = `Data:\n${taskSummary}\n\nOverdue:\n${overdueList || "None"}\n\nIncomplete tasks:\n${incomplete || "None"}\n\nWhich tasks need attention first and why?`;
    } else {
      systemPrompt = "You are an activity summarization AI. Summarize recent team activity concisely in Markdown and highlight patterns or trends." + langNote;
      userPrompt = `Recent activity:\n${recentActivity || "None"}\n\nTask overview:\n${taskSummary}`;
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) return json({ error: "GROQ_API_KEY is not configured" }, 500);

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Groq API error:", aiResponse.status, errText);
      if (aiResponse.status === 429) return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      return json({ error: "AI service error" }, 502);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content ?? "No insights available.";
    return json({ insight: content });
  } catch (e) {
    console.error("ai-insights error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
