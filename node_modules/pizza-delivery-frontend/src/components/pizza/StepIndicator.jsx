const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies']

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${idx < currentStep  ? 'bg-primary-500 text-white' : ''}
                ${idx === currentStep ? 'bg-primary-500 text-white ring-4 ring-primary-100' : ''}
                ${idx > currentStep  ? 'bg-gray-100 text-gray-400' : ''}
              `}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${idx === currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-16 h-0.5 mb-4 mx-1 transition-all duration-300 ${idx < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
