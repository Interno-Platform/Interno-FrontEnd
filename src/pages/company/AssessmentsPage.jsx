import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import { assessments } from '@/data/mockData';

const CompanyAssessmentsPage = () => {
  const rows = assessments[0]?.results || [];

  return (
    <Table
      columns={['Trainee Name', 'Score', 'Status', 'Date']}
      rows={rows}
      renderRow={(row, index) => (
        <tr key={index} className="border-t border-slate-100">
          <td className="px-4 py-3">{row.traineeName}</td>
          <td className="px-4 py-3">{row.score}%</td>
          <td className="px-4 py-3"><Badge>{row.status === 'Passed' ? 'Accepted' : 'Rejected'}</Badge></td>
          <td className="px-4 py-3">{row.date}</td>
        </tr>
      )}
    />
  );
};

export default CompanyAssessmentsPage;
