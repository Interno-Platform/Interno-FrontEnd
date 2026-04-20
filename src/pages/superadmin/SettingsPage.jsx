import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const SettingsPage = () => (
  <Card className="max-w-2xl space-y-3">
    <h2 className="text-xl font-bold">System Settings</h2>
    <Input label="Platform Name" defaultValue="Interno" />
    <Input label="Support Email" defaultValue="support@interno.com" />
    <Button>Save Settings</Button>
  </Card>
);

export default SettingsPage;
