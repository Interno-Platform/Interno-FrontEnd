import { Bell, BriefcaseBusiness, Clock3 } from 'lucide-react';
import Card from '@/components/common/Card';

const notifications = [
  {
    id: 1,
    title: 'Application status updated',
    message: 'BrightLabs moved your Frontend Intern application to interview stage.',
    time: '2 hours ago',
    type: 'update',
  },
  {
    id: 2,
    title: 'New internship match',
    message: 'A new role at FinEdge matches 78% of your skills.',
    time: '5 hours ago',
    type: 'match',
  },
  {
    id: 3,
    title: 'Assessment reminder',
    message: 'Frontend Fundamentals assessment is due tomorrow at 5:00 PM.',
    time: '1 day ago',
    type: 'reminder',
  },
];

const iconByType = {
  update: <BriefcaseBusiness className="h-4 w-4" />,
  match: <Bell className="h-4 w-4" />,
  reminder: <Clock3 className="h-4 w-4" />,
};

const NotificationsPage = () => (
  <div className="space-y-5">
    <Card className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Activity center</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
      <p className="text-sm text-slate-600">Latest updates from your applications and assessments.</p>
    </Card>

    <div className="space-y-3">
      {notifications.map((item) => (
        <Card key={item.id} className="border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">{iconByType[item.type]}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default NotificationsPage;
