import { Link } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

const AssessmentsPage = () => (
  <Card className="space-y-4">
    <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
    <p className="text-sm text-slate-600">
      Assessment flow starts after you apply to an internship. From internship
      details, submit your application then continue with quiz and coding exam.
    </p>
    <div className="flex flex-wrap gap-2">
      <Link to="/trainee/internships">
        <Button>Browse Internships</Button>
      </Link>
      <Link to="/trainee/applications">
        <Button variant="ghost">My Applications</Button>
      </Link>
    </div>
  </Card>
);

export default AssessmentsPage;

