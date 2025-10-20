'use client';

interface Step4ReviewProps {
  title: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  rewardId: string;
}

export default function Step4Review({ title, description, startDate, endDate, rewardId }: Step4ReviewProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Review Campaign</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium">Campaign Title:</p>
          <p>{title}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Campaign Description:</p>
          <p>{description}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Start Date:</p>
          <p>{startDate?.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium">End Date:</p>
          <p>{endDate?.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Reward ID:</p>
          <p>{rewardId}</p>
        </div>
      </div>
    </div>
  );
}
