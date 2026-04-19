import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Clock3, Mail, MessageSquareText, UserRound } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { getContactUsMessages } from "@/services/websiteService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const getInitials = (name) =>
  String(name || "Unknown")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "UN";

const ContactMessageDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { messageId } = useParams();

  const messageFromState = location.state?.message || null;

  const [message, setMessage] = useState(messageFromState);
  const [isLoading, setIsLoading] = useState(!messageFromState);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (messageFromState) {
      return;
    }

    const loadMessage = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await getContactUsMessages();
        const list = Array.isArray(response?.data) ? response.data : [];

        const found = list.find(
          (item, index) => String(item?.id ?? index) === String(messageId),
        );

        if (!found) {
          setLoadError("Message not found.");
          setMessage(null);
          return;
        }

        setMessage(found);
      } catch (error) {
        setLoadError(error?.message || "Unable to load message details.");
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessage();
  }, [messageFromState, messageId]);

  const senderName = useMemo(
    () => message?.name || "Unknown sender",
    [message?.name],
  );

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#155e75] px-6 py-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
              Contact Inbox
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Contact Message Details
            </h2>
            <p className="mt-2 text-sm text-cyan-50/90">
              Review the full message from website Contact Us form.
            </p>
          </div>
          <Button
            variant="ghost"
            className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate("/superadmin/contact-messages")}
          >
            Back to Messages
          </Button>
        </div>
      </section>

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-sm text-slate-600">Loading message details...</p>
        </Card>
      ) : null}

      {!isLoading && message ? (
        <Card className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-base font-black text-cyan-700">
                  {getInitials(senderName)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {senderName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Incoming Contact Message
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDateTime(message.created_at || message.updated_at)}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Detail
              label="Name"
              value={senderName}
              icon={<UserRound className="h-4 w-4" />}
            />
            <Detail
              label="Email"
              value={message.email || "N/A"}
              icon={<Mail className="h-4 w-4" />}
            />
            <Detail
              label="Subject"
              value={message.subject || "No subject"}
              icon={<MessageSquareText className="h-4 w-4" />}
            />
            <Detail
              label="Date"
              value={formatDateTime(message.created_at || message.updated_at)}
              icon={<Clock3 className="h-4 w-4" />}
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Message
            </p>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-800">
              {message.message || "No message content."}
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

const Detail = ({ label, value, icon }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
      {icon ? <span className="text-slate-400">{icon}</span> : null}
      <span>{label}</span>
    </div>
    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
  </div>
);

export default ContactMessageDetailsPage;
