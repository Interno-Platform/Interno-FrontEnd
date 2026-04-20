import { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { assessments } from '@/data/mockData';

const stepTitles = ['Assessment Info', 'Add Questions', 'Assign To', 'Review & Publish'];

const AssessmentsPage = () => {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([{ type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '' }]);

  const addQuestion = () => setQuestions((prev) => [...prev, { type: 'boolean', text: '', correctAnswer: 'True' }]);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">Create Assessment</h2>
        <p className="text-sm text-slate-600">Step {step}: {stepTitles[step - 1]}</p>
        {step === 1 && <div className="mt-4 grid gap-3 md:grid-cols-2"><Input label="Title" /><Input label="Duration (mins)" /><Input label="Pass Score %" /><Input label="Description" /></div>}
        {step === 2 && <div className="mt-4 space-y-3">{questions.map((_, index) => <Card key={index}>Question {index + 1}: MCQ / True-False / Short Answer</Card>)}<Button onClick={addQuestion}>Add Question</Button></div>}
        {step === 3 && <div className="mt-4 grid gap-3 md:grid-cols-3"><label><input type="radio" name="assign" defaultChecked /> All Trainees</label><label><input type="radio" name="assign" /> Specific Company</label><label><input type="radio" name="assign" /> Specific Trainees</label></div>}
        {step === 4 && <div className="mt-4"><p className="text-sm">Review details and publish assessment.</p><Button className="mt-3">Publish Assessment</Button></div>}
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button disabled={step === 4} onClick={() => setStep((s) => s + 1)}>Next</Button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">All Assessments</h3>
        <div className="space-y-2">
          {assessments.map((assessment) => <div key={assessment.id} className="rounded-lg border border-slate-200 p-3"><p className="font-semibold">{assessment.title}</p><p className="text-sm text-slate-600">{assessment.description}</p></div>)}
        </div>
      </Card>
    </div>
  );
};

export default AssessmentsPage;
