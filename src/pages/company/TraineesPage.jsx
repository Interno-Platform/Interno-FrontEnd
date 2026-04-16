import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { trainees } from '@/data/mockData';

const CompanyTraineesPage = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {trainees.map((trainee) => (
      <Card key={trainee.id} className="space-y-3">
        <h3 className="font-semibold">{trainee.name}</h3>
        <p className="text-sm text-slate-600">Progress: {trainee.progress}%</p>
        <div className="h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-primary" style={{ width: `${trainee.progress}%` }} /></div>
        <div className="flex gap-2"><Button>Assign Assessment</Button><Button variant="ghost">View Profile</Button></div>
      </Card>
    ))}
  </div>
);

export default CompanyTraineesPage;
