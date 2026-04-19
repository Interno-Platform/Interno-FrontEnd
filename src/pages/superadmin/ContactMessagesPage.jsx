import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageCircleMore, UserRound } from "lucide-react";
import Card from "@/components/common/Card";
import { getContactUsMessages } from "@/services/websiteService";

const getInitials = (name) =>
  String(name || "Unknown")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "UN";

const getPreview = (value, maxLength = 120) => {
  const text = String(value || "").trim();
  if (!text) return "No message";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const ContactMessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadMessages = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getContactUsMessages();
      setMessages(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setLoadError(error?.message || "Unable to load contact messages.");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-[#0f766e] via-[#0e7f74] to-[#0c5f76] px-6 py-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-100">
              Superadmin Inbox
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Contact Messages
            </h2>
            <p className="mt-2 text-sm text-teal-50/90">
              Messages submitted from the public Contact Us page.
            </p>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-right backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">
              Total Inbox
            </p>
            <p className="text-2xl font-black">{messages.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-teal-100 bg-teal-50/30 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Total Messages
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {messages.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-cyan-100 bg-cyan-50/30 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <MessageCircleMore className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Last Subject
              </p>
              <p className="line-clamp-1 text-sm font-bold text-slate-900">
                {messages[0]?.subject || "No subject yet"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Last Sender
              </p>
              <p className="line-clamp-1 text-sm font-bold text-slate-900">
                {messages[0]?.name || "Unknown"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Subject</th>
                <th className="px-5 py-4 font-semibold">Message</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={6}
                  >
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={6}
                  >
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                messages.map((message, index) => (
                  <tr
                    key={
                      message.id ||
                      `${message.email || "unknown"}-${message.created_at || index}`
                    }
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">
                          {getInitials(message.name)}
                        </span>
                        <span className="font-semibold">
                          {message.name || "Unknown sender"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {message.email || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <span className="inline-flex max-w-[240px] items-center rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                        <span className="line-clamp-1">
                          {message.subject || "No subject"}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-[420px] px-5 py-4 text-slate-600">
                      <p className="line-clamp-2">
                        {getPreview(message.message)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {message.created_at
                        ? new Date(message.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                        onClick={() =>
                          navigate(
                            `/superadmin/contact-messages/${message.id ?? index}`,
                            {
                              state: {
                                message,
                              },
                            },
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ContactMessagesPage;
