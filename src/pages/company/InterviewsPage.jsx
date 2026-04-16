import Card from '@/components/common/Card';

const interviews = [
  { candidate: 'Sarah Jenkins', role: 'Marketing Intern', slot: 'Tomorrow 10:00 AM', type: 'Video Call' },
  { candidate: 'David Lee', role: 'Software Engineer Trainee', slot: 'Thu 12:30 PM', type: 'On-site' },
  { candidate: 'Michael Chen', role: 'Product Design Intern', slot: 'Fri 02:00 PM', type: 'Video Call' },
];

const InterviewsPage = () => (
  <div className="space-y-4">
    <Card className="space-y-1">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Interviews</h2>
      <p className="text-sm text-slate-600">Manage upcoming interview schedule.</p>
    </Card>
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Candidate</th>
            <th className="px-5 py-4 font-semibold">Role</th>
            <th className="px-5 py-4 font-semibold">Scheduled Slot</th>
            <th className="px-5 py-4 font-semibold">Interview Type</th>
            <th className="px-5 py-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((item) => (
            <tr key={item.candidate} className="border-t border-slate-100">
              <td className="px-5 py-4 font-semibold text-slate-900">{item.candidate}</td>
              <td className="px-5 py-4 text-slate-600">{item.role}</td>
              <td className="px-5 py-4 text-slate-600">{item.slot}</td>
              <td className="px-5 py-4 text-slate-600">{item.type}</td>
              <td className="px-5 py-4">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700" type="button">
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

export default InterviewsPage;
