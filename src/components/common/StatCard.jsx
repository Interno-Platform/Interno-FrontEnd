import Card from "./Card";

const StatCard = ({ label, value, icon }) => (
  <Card className="space-y-3 p-5 hover:shadow-lg">
    <div className="text-muted-foreground">{icon}</div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold text-foreground">{value}</p>
  </Card>
);

export default StatCard;
