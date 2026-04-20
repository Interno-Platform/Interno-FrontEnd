import Card from '@/components/common/Card';

const conversations = [
  { name: 'Sarah Jenkins', message: 'Thank you for the update, looking forward to the interview.', time: '2m ago' },
  { name: 'David Lee', message: 'Can I reschedule my technical round to Thursday?', time: '15m ago' },
  { name: 'Emily Davis', message: 'I have submitted all required documents.', time: '1h ago' },
];

const MessagesPage = () => (
  <div className="space-y-4">
    <Card className="space-y-1">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Messages</h2>
      <p className="text-sm text-slate-600">Recent candidate conversations.</p>
    </Card>
    <div className="space-y-3">
      {conversations.map((item) => (
        <Card key={item.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
            <span className="text-xs text-slate-500">{item.time}</span>
          </div>
          <p className="text-sm text-slate-600">{item.message}</p>
        </Card>
      ))}
    </div>
  </div>
);

export default MessagesPage;
