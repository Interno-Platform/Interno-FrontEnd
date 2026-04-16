import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { applicationTrend, traineesPerCompany } from '@/data/mockData';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ReportsPage = () => (
  <div className="space-y-4">
    <Card className="p-6">
      <h3 className="mb-3 text-lg font-semibold">Applications Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={applicationTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #dbe3f0', background: '#ffffff', boxShadow: '0 14px 30px -20px rgba(15,23,42,0.45)' }}
            cursor={{ stroke: '#8fbd93', strokeDasharray: '4 4' }}
          />
          <Area type="monotone" dataKey="applications" stroke="#2f6534" fill="#c6ddc8" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
    <Card className="p-6">
      <h3 className="mb-3 text-lg font-semibold">Top Companies</h3>
      <div className="space-y-2">{traineesPerCompany.map((item) => <div key={item.company} className="flex justify-between rounded-xl border border-border/80 p-3 transition-all duration-200 hover:bg-muted/40"><span>{item.company}</span><span className="text-muted-foreground">{item.trainees} trainees</span></div>)}</div>
      <div className="mt-4 flex gap-2"><Button>Export PDF</Button><Button variant="ghost">Export Excel</Button></div>
    </Card>
  </div>
);

export default ReportsPage;
