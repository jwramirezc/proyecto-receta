type PortionStepperProps = {
  portions: number;
  onChange: (value: number) => void;
};

export default function PortionStepper({ portions, onChange }: PortionStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="portions" className="text-sm font-medium">
        Porciones
      </label>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, portions - 1))}
        className="h-9 w-9 rounded-md border border-slate-300 text-lg hover:bg-slate-50"
        aria-label="Reducir porciones"
      >
        -
      </button>
      <input
        id="portions"
        type="number"
        min={1}
        max={6}
        value={portions}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (Number.isFinite(parsed)) {
            onChange(Math.min(6, Math.max(1, parsed)));
          }
        }}
        className="h-9 w-16 rounded-md border border-slate-300 text-center"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(6, portions + 1))}
        className="h-9 w-9 rounded-md border border-slate-300 text-lg hover:bg-slate-50"
        aria-label="Aumentar porciones"
      >
        +
      </button>
    </div>
  );
}
