import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Plus, Trash2, Clock, BellRing } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alarm Clock" },
      { name: "description", content: "A simple alarm clock" },
    ],
  }),
  component: Index,
});

interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function Index() {
  const [now, setNow] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: "1", hour: 7, minute: 30, label: "Morning", enabled: true },
    { id: "2", hour: 9, minute: 0, label: "Work", enabled: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newHour, setNewHour] = useState("07");
  const [newMinute, setNewMinute] = useState("00");
  const [newLabel, setNewLabel] = useState("");
  const [ringingId, setRingingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentS = now.getSeconds();
    if (currentS !== 0) return;

    for (const alarm of alarms) {
      if (alarm.enabled && alarm.hour === currentH && alarm.minute === currentM) {
        setRingingId(alarm.id);
      }
    }
  }, [now, alarms]);

  const dismiss = useCallback(() => {
    setRingingId(null);
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    if (ringingId === id) setRingingId(null);
  }, [ringingId]);

  const addAlarm = useCallback(() => {
    const h = Math.max(0, Math.min(23, parseInt(newHour, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(newMinute, 10) || 0));
    const alarm: Alarm = {
      id: crypto.randomUUID(),
      hour: h,
      minute: m,
      label: newLabel.trim() || "Alarm",
      enabled: true,
    };
    setAlarms((prev) =>
      [...prev, alarm].sort((a, b) => a.hour * 60 + a.minute - b.hour * 60 - b.minute)
    );
    setNewHour("07");
    setNewMinute("00");
    setNewLabel("");
    setShowForm(false);
  }, [newHour, newMinute, newLabel]);

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12" style={{ backgroundColor: "#0c0a09" }}>
      <div className="w-full max-w-sm">
        {/* Clock face */}
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center justify-center rounded-full border-2"
            style={{
              width: 260,
              height: 260,
              borderColor: "#78350f",
              boxShadow: ringingId
                ? "0 0 40px 10px rgba(234,88,12,0.35), inset 0 0 30px rgba(234,88,12,0.1)"
                : "0 0 20px rgba(120,53,15,0.15)",
              animation: ringingId ? "pulse-ring 1s ease-in-out infinite" : "none",
            }}
          >
            <div>
              <div
                className="text-5xl font-bold tracking-wider"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: ringingId ? "#ea580c" : "#e7e5e4",
                }}
              >
                {pad(now.getHours())}:{pad(now.getMinutes())}
              </div>
              <div className="mt-1 text-sm" style={{ color: "#a8a29e", fontFamily: "'JetBrains Mono', monospace" }}>
                {pad(now.getSeconds())}
              </div>
              <div className="mt-2 text-xs" style={{ color: "#78716c" }}>
                {now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Ringing banner */}
        {ringingId && (
          <div
            className="mb-6 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: "#7c2d12", color: "#fff7ed" }}
          >
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5" style={{ animation: "shake 0.5s ease-in-out infinite" }} />
              <span className="text-sm font-medium">
                {alarms.find((a) => a.id === ringingId)?.label ?? "Alarm"} is ringing!
              </span>
            </div>
            <button
              onClick={dismiss}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "#fff7ed", color: "#7c2d12" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Alarms list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#a8a29e" }}>
              Alarms
            </h2>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ backgroundColor: "#292524", color: "#d6d3d1" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#44403c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#292524";
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {showForm && (
            <div className="rounded-xl p-4" style={{ backgroundColor: "#1c1917" }}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: "#78716c" }}>
                    Hour
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={newHour}
                    onChange={(e) => setNewHour(pad(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0))))}
                    className="w-16 rounded-lg px-2 py-1.5 text-center text-sm font-medium outline-none"
                    style={{ backgroundColor: "#292524", color: "#e7e5e4" }}
                  />
                </div>
                <span className="mt-5 text-lg font-bold" style={{ color: "#57534e" }}>:</span>
                <div className="flex flex-col">
                  <label className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: "#78716c" }}>
                    Minute
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={newMinute}
                    onChange={(e) => setNewMinute(pad(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0))))}
                    className="w-16 rounded-lg px-2 py-1.5 text-center text-sm font-medium outline-none"
                    style={{ backgroundColor: "#292524", color: "#e7e5e4" }}
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <label className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: "#78716c" }}>
                    Label
                  </label>
                  <input
                    type="text"
                    placeholder="Morning"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addAlarm(); }}
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
                    style={{ backgroundColor: "#292524", color: "#e7e5e4" }}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: "#a8a29e" }}
                >
                  Cancel
                </button>
                <button
                  onClick={addAlarm}
                  className="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={{ backgroundColor: "#ea580c", color: "#fff7ed" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c2410c"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ea580c"; }}
                >
                  Save Alarm
                </button>
              </div>
            </div>
          )}

          {alarms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="mb-3 h-8 w-8" style={{ color: "#44403c" }} />
              <p className="text-sm" style={{ color: "#78716c" }}>
                No alarms set
              </p>
              <p className="mt-1 text-xs" style={{ color: "#57534e" }}>
                Tap "Add" to create your first alarm
              </p>
            </div>
          )}

          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
              style={{
                backgroundColor: alarm.id === ringingId ? "#431407" : "#1c1917",
                border: alarm.id === ringingId ? "1px solid #9a3412" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" style={{ color: alarm.enabled ? "#ea580c" : "#57534e" }} />
                <div>
                  <div className="text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: alarm.enabled ? "#e7e5e4" : "#57534e" }}>
                    {pad(alarm.hour)}:{pad(alarm.minute)}
                  </div>
                  <div className="text-xs" style={{ color: alarm.enabled ? "#a8a29e" : "#57534e" }}>
                    {alarm.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className="relative h-7 w-12 rounded-full transition-colors"
                  style={{ backgroundColor: alarm.enabled ? "#ea580c" : "#44403c" }}
                >
                  <span
                    className="absolute top-0.5 h-6 w-6 rounded-full transition-all"
                    style={{
                      backgroundColor: "#e7e5e4",
                      left: alarm.enabled ? "26px" : "2px",
                    }}
                  />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: "#78716c" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.backgroundColor = "#292524"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#78716c"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
