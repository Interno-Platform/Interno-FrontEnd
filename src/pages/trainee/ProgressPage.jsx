import Card from '@/components/common/Card';

const ProgressPage = () => (
  <Card className="space-y-3">
    <h2 className="text-xl font-bold">My Progress</h2>
    <p className="text-sm text-slate-600">Overall internship completion: 72%</p>
    <div className="h-3 overflow-hidden rounded bg-slate-200"><div className="h-full w-[72%] bg-primary" /></div>
  </Card>
);

export default ProgressPage;
