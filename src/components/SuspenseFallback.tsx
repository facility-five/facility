import { LoadingSpinner } from "./LoadingSpinner";

export const SuspenseFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" className="text-purple-600" />
      </div>
    </div>
  );
};
