import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';

const ApplicationSuccessPage = () => (
  <div className="mx-auto max-w-2xl py-12">
    <Card className="space-y-5 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Application Submitted Successfully</h1>
      <p className="text-sm text-slate-600">Your application was sent to the company. You can monitor updates in your applications dashboard.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link className="rounded-lg bg-[#164616] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123a12]" to="/trainee/applications">
          Go to My Applications
        </Link>
        <Link className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" to="/trainee">
          Go to Dashboard
        </Link>
      </div>
    </Card>
  </div>
);

export default ApplicationSuccessPage;
