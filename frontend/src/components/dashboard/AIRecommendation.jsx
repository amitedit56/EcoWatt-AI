import Card from "@/components/ui/Card";
import { Bot, Send } from "lucide-react";

export default function AIRecommendation() {
  return (
    <Card className="h-full p-5">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
            <Bot className="text-violet-400" size={20} />
          </div>

          <h2 className="text-lg font-semibold text-white">
            AI Assistant
          </h2>

        </div>

        <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
          New Chat
        </button>

      </div>

      {/* User Message */}

      <div className="mb-5 flex justify-end">

        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-emerald-600 p-4 text-sm text-white">
          Why is my electricity bill high this month?
        </div>

      </div>

      {/* AI Response */}

      <div className="mb-6 flex gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
          🤖
        </div>

        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-800 p-4 text-sm leading-7 text-slate-300">

          Your electricity bill is higher because AC usage increased by 38%
          and evening usage is longer than usual.

          <br />
          <br />

          Try setting AC to <strong>24–25°C</strong> and switch to LED bulbs.

          You can save up to <span className="font-semibold text-emerald-400">14%</span>.

        </div>

      </div>

      {/* Input */}

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a] p-2">

        <input
          type="text"
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent px-3 text-white outline-none placeholder:text-slate-500"
        />

        <button className="rounded-lg bg-emerald-500 p-3 transition hover:bg-emerald-600">
          <Send className="text-white" size={18} />
        </button>

      </div>

    </Card>
  );
}