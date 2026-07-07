import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, language } = await req.json();
    const lang = language === "ja" ? "ja" : "en";

    // Fetch tasks and activity logs
    const [tasksRes, logsRes, profilesRes] = await Promise.all([
      supabase.from("tasks").select("id, title, status, priority, due_date, assigned_to, created_at"),
      supabase.from("activity_logs").select("action, details, created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("user_id, full_name"),
    ]);

    const tasks = tasksRes.data ?? [];
    const logs = logsRes.data ?? [];
    const profiles = profilesRes.data ?? [];
    const profileMap: Record<string, string> = {};
    profiles.forEach((p) => { profileMap[p.user_id] = p.full_name; });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const completedToday = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < now
    );
    const pending = tasks.filter((t) => t.status === "pending");
    const inProgress = tasks.filter((t) => t.status === "in_progress");

    // Build context for AI
    const taskSummary = `Total tasks: ${tasks.length}, Completed: ${completedToday}, Overdue: ${overdue.length}, Pending: ${pending.length}, In Progress: ${inProgress.length}.`;

    const overdueList = overdue
      .map((t) => `- "${t.title}" (priority: ${t.priority}, due: ${t.due_date}, assigned to: ${profileMap[t.assigned_to!] ?? "unassigned"})`)
      .join("\n");

    const pendingHighPriority = tasks
      .filter((t) => t.status !== "completed" && t.priority === "high")
      .map((t) => `- "${t.title}" (due: ${t.due_date ?? "no deadline"}, assigned to: ${profileMap[t.assigned_to!] ?? "unassigned"})`)
      .join("\n");

    const recentActivity = logs
      .slice(0, 10)
      .map((l) => `- ${l.details}`)
      .join("\n");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "summary") {
      systemPrompt = lang === "ja"
        ? "あなたはタスク管理の専門AIアシスタントです。データに基づいて日次サマリーを簡潔に作成してください。箇条書きで見やすくまとめてください。"
        : "You are an expert task management AI. Create a concise daily activity summary using bullet points. Be direct and actionable.";
      userPrompt = `Here is today's data:\n${taskSummary}\n\nOverdue tasks:\n${overdueList || "None"}\n\nRecent activity:\n${recentActivity || "No recent activity"}\n\nProvide a brief daily summary with key highlights and concerns.`;
    } else if (type === "priority") {
      systemPrompt = lang === "ja"
        ? "あなたはタスク優先度の専門AIです。期限とステータスに基づいて、最も注意が必要なタスクを優先順位付けしてください。番号付きリストで回答してください。"
        : "You are a task prioritization expert. Rank the tasks that need immediate attention based on deadlines, priority level, and status. Use a numbered list.";
      userPrompt = `Current task data:\n${taskSummary}\n\nHigh priority incomplete tasks:\n${pendingHighPriority || "None"}\n\nOverdue tasks:\n${overdueList || "None"}\n\nAll incomplete tasks:\n${tasks.filter(t => t.status !== "completed").map(t => `- "${t.title}" (priority: ${t.priority}, status: ${t.status}, due: ${t.due_date ?? "none"})`).join("\n") || "None"}\n\nSuggest which tasks need attention first and why.`;
    } else if (type === "activity") {
      systemPrompt = lang === "ja"
        ? "あなたはアクティビティログの要約AIです。最近のアクティビティを簡潔に要約してください。重要なパターンやトレンドがあれば指摘してください。"
        : "You are an activity summarization AI. Summarize the recent activity concisely. Highlight any important patterns or trends.";
      userPrompt = `Recent activity log entries:\n${recentActivity || "No activity recorded"}\n\nTask overview:\n${taskSummary}\n\nSummarize the recent activity and highlight any notable patterns.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type. Use: summary, priority, or activity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = "gemini-2.5-flash";
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Gemini API error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error", details: errText }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content =
      aiData.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      "No insights available.";

    return new Response(JSON.stringify({ insight: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
