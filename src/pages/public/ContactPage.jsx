import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { notify } from "@/utils/notify";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});


const ContactPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    notify.success("Your message has been sent successfully.");
    reset();
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-border/70 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Get in touch
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          Contact the Interno Team
        </h1>
        <p className="mt-3 text-muted-foreground">
          Need support with onboarding, approvals, or platform setup? We are
          here to help.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Subject"
              error={errors.subject?.message}
              {...register("subject")}
            />
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Message
              </span>
              <textarea
                className="field-input min-h-[140px]"
                rows="6"
                {...register("message")}
              />
              {errors.message ? (
                <span className="text-xs text-rose-600">
                  {errors.message.message}
                </span>
              ) : null}
            </label>
            <Button type="submit">Send Message</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <InfoCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value="support@interno.com"
          />
          <InfoCard
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value="+1 (555) 222-1020"
          />
          <InfoCard
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value="221 Internship Blvd, New York"
          />
          <Card>
            <h3 className="font-semibold text-slate-900">Business Hours</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Mon - Fri: 9:00 AM - 6:00 PM
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <Card>
    <div className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  </Card>
);

export default ContactPage;
